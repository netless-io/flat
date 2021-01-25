import { useEffect, useRef, useState } from "react";
import { action, makeAutoObservable, observable, runInAction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import dateSub from "date-fns/sub";
import { Rtc as RTCAPI, RtcChannelType } from "../apiMiddleware/Rtc";
import {
    ClassModeType,
    NonDefaultUserProp,
    Rtm as RTMAPI,
    RTMessage,
    RTMessageType,
    RTMEvents,
} from "../apiMiddleware/Rtm";
import { CloudRecording } from "../apiMiddleware/CloudRecording";
import { CloudRecordStartPayload } from "../apiMiddleware/flatServer/agora";
import {
    pauseClass,
    startClass,
    startRecordRoom,
    stopClass,
    stopRecordRoom,
    usersInfo,
} from "../apiMiddleware/flatServer";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";
import { RoomItem, roomStore } from "./RoomStore";
import { globalStore } from "./GlobalStore";
import { NODE_ENV } from "../constants/Process";

export interface User {
    userUUID: string;
    rtcUID: number;
    avatar: string;
    name: string;
    camera: boolean;
    mic: boolean;
    isSpeak: boolean;
    isRaiseHand: boolean;
}

export type RecordingConfig = Required<
    CloudRecordStartPayload["agoraData"]["clientRequest"]
>["recordingConfig"];

export class ClassRoomStore {
    readonly roomUUID: string;
    /** User uuid of the current user */
    readonly userUUID: string;
    /** RTM messages */
    messages = observable.array<RTMessage>([]);
    /** creator info */
    creator: User | null = null;
    /** current user info */
    currentUser: User | null = null;
    /** joiners who have speaking access */
    speakingJoiners = observable.array<User>([]);
    /** joiners who are raising hands */
    handRaisingJoiners = observable.array<User>([]);
    /** the rest of joiners */
    otherJoiners = observable.array<User>([]);
    /** room class mode */
    classMode = ClassModeType.Lecture;
    /** is creator temporary banned room for joiner operations */
    isBan = false;
    /** is Cloud Recording on */
    isRecording = false;
    /** is RTC on */
    isCalling = false;

    readonly rtcChannelType: RtcChannelType;

    readonly rtc: RTCAPI;
    readonly rtm: RTMAPI;
    readonly cloudRecording: CloudRecording;

    /** This ownerUUID is from url params matching which cannot be trusted */
    private readonly ownerUUIDFromParams: string;

    private recordingConfig: RecordingConfig;

    private noMoreRemoteMessages = false;

    private cancelHandleChannelStatusTimeout?: number;

    constructor(config: { roomUUID: string; ownerUUID: string; recordingConfig: RecordingConfig }) {
        if (!globalStore.userUUID) {
            throw new Error("Missing user uuid");
        }

        this.roomUUID = config.roomUUID;
        this.ownerUUIDFromParams = config.ownerUUID;
        this.userUUID = globalStore.userUUID;
        this.recordingConfig = config.recordingConfig;
        this.rtcChannelType = config.recordingConfig.channelType ?? RtcChannelType.Communication;

        this.rtc = new RTCAPI({ roomUUID: config.roomUUID, isCreator: this.isCreator });
        this.rtm = new RTMAPI();
        this.cloudRecording = new CloudRecording({ roomUUID: config.roomUUID });

        makeAutoObservable<this, "noMoreRemoteMessages" | "cancelHandleChannelStatusTimeout">(
            this,
            {
                rtc: observable.ref,
                rtm: observable.ref,
                cloudRecording: observable.ref,
                noMoreRemoteMessages: false,
                cancelHandleChannelStatusTimeout: false,
            },
        );
    }

    get ownerUUID(): string {
        if (this.roomInfo) {
            if (NODE_ENV === "development") {
                if (this.roomInfo.ownerUUID !== this.ownerUUIDFromParams) {
                    throw new Error("ClassRoom Error: ownerUUID mismatch!");
                }
            }
            return this.roomInfo.ownerUUID;
        }
        return this.ownerUUIDFromParams;
    }

    get roomInfo(): RoomItem | undefined {
        return roomStore.rooms.get(this.roomUUID);
    }

    get isCreator(): boolean {
        return this.ownerUUID === this.userUUID;
    }

    get roomStatus(): RoomStatus {
        return this.roomInfo?.roomStatus || RoomStatus.Idle;
    }

    get joinerTotalCount(): number {
        return (
            this.speakingJoiners.length + this.handRaisingJoiners.length + this.otherJoiners.length
        );
    }

    startClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Started);

    pauseClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Paused);

    resumeClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Started);

    stopClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Stopped);

    toggleCalling = async (): Promise<void> => {
        this.isCalling = !this.isCalling;
        if (!this.currentUser) {
            return;
        }
        try {
            if (this.isCalling) {
                await this.rtc.join(this.currentUser.rtcUID, this.rtcChannelType);
            } else {
                if (this.isRecording) {
                    await this.stopRecording();
                }
                this.rtc.leave();
            }
        } catch (e) {
            console.error(e);
            runInAction(() => {
                // reset state
                this.isCalling = !this.isCalling;
            });
        }
    };

    toggleRecording = async (): Promise<void> => {
        if (this.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
    };

    toggleClassMode = async (): Promise<void> => {
        const oldClassMode = this.classMode;
        this.classMode =
            oldClassMode === ClassModeType.Lecture
                ? ClassModeType.Interaction
                : ClassModeType.Lecture;
        try {
            await this.rtm.sendCommand({
                type: RTMessageType.ClassMode,
                value: this.classMode,
                keepHistory: true,
            });
        } catch (e) {
            console.error(e);
            runInAction(() => {
                this.classMode = oldClassMode;
            });
        }
    };

    updateClassMode = (classMode: ClassModeType): void => {
        this.classMode = classMode;
    };

    updateRoomStatus = (roomStatus: RoomStatus): void => {
        if (this.roomInfo) {
            this.roomInfo.roomStatus = roomStatus;
        }
    };

    updateHistory = async (): Promise<void> => {
        if (this.noMoreRemoteMessages) {
            return;
        }

        let messages: RTMessage[] = [];

        try {
            const oldestTimestap =
                this.messages.length > 0 ? this.messages[0].timestamp : Date.now();
            messages = await this.rtm.fetchTextHistory(
                dateSub(oldestTimestap, { years: 1 }).valueOf(),
                oldestTimestap - 1,
            );
        } catch (e) {
            console.warn(e);
        }

        if (messages.length <= 0) {
            this.noMoreRemoteMessages = true;
            return;
        }

        const textMessages = messages.filter(
            (message): message is RTMessage =>
                message.type === RTMessageType.ChannelMessage ||
                message.type === RTMessageType.Notice,
        );

        runInAction(() => {
            this.messages.unshift(...textMessages);
        });
    };

    /** joiner updates own camera and mic state */
    updateDeviceState = (userUUID: string, camera: boolean, mic: boolean): void => {
        if (this.userUUID === userUUID || this.isCreator) {
            this.sortUsers(user => {
                if (user.userUUID === userUUID) {
                    // creator can turn off joiner's camera and mic
                    // creator can request joiner to turn on camera and mic
                    if (userUUID !== this.userUUID) {
                        if (camera && !user.camera) {
                            camera = user.camera;
                        }

                        if (mic && !user.mic) {
                            mic = user.mic;
                        }
                    }

                    if (camera !== user.camera || mic !== user.mic) {
                        user.isRaiseHand = false;
                        user.camera = camera;
                        user.mic = mic;
                        return false;
                    }
                }
                return true;
            });
            this.rtm.sendCommand({
                type: RTMessageType.DeviceState,
                value: { userUUID, camera, mic },
                keepHistory: true,
            });
        }
    };

    acceptRaisehand = (userUUID: string): void => {
        if (this.isCreator) {
            this.sortUsers(user => {
                if (userUUID === user.userUUID) {
                    user.isRaiseHand = false;
                    user.isSpeak = true;
                    user.camera = false;
                    user.mic = true;
                    return false;
                }
                return true;
            });
            this.rtm.sendCommand({
                type: RTMessageType.AcceptRaiseHand,
                value: { userUUID, accept: true },
                keepHistory: true,
            });
        }
    };

    onMessageSend = async (text: string): Promise<void> => {
        if (this.isBan && !this.isCreator) {
            return;
        }
        await this.rtm.sendMessage(text);
        this.addMessage(RTMessageType.ChannelMessage, text, this.userUUID);
    };

    onCancelAllHandRaising = (): void => {
        if (this.isCreator) {
            this.cancelAllHandRaising();
            this.rtm.sendCommand({
                type: RTMessageType.CancelAllHandRaising,
                value: true,
                keepHistory: true,
            });
        }
    };

    /** When urrent user (who is a joiner) raises hand */
    onToggleHandRaising = (): void => {
        if (this.isCreator || this.currentUser?.isSpeak) {
            return;
        }
        this.sortUsers(user => {
            if (user.userUUID === this.userUUID) {
                user.isRaiseHand = !user.isRaiseHand;
                return false;
            }
            return true;
        });
        if (this.currentUser) {
            this.rtm.sendCommand({
                type: RTMessageType.RaiseHand,
                value: this.currentUser.isRaiseHand,
                keepHistory: true,
            });
        }
    };

    onToggleBan = async (): Promise<void> => {
        if (!this.isCreator) {
            return;
        }
        this.isBan = !this.isBan;
        this.addMessage(RTMessageType.BanText, this.isBan, this.userUUID);
        try {
            await this.rtm.sendCommand({
                type: RTMessageType.BanText,
                value: this.isBan,
                keepHistory: true,
            });
        } catch (e) {
            console.error(e);
            runInAction(() => {
                this.isBan = !this.isBan;
            });
        }
    };

    onSpeak = async (configs: { userUUID: string; speak: boolean }[]): Promise<void> => {
        if (!this.isCreator) {
            // joiner can only turn off speaking
            configs = configs.filter(config => !config.speak && config.userUUID === this.userUUID);
            if (configs.length <= 0) {
                return;
            }
        }
        this.speak(configs);
        try {
            await this.rtm.sendCommand({
                type: RTMessageType.Speak,
                value: configs,
                keepHistory: true,
            });
        } catch (e) {
            // @TODO handle error
            console.error(e);
        }
    };

    async init(): Promise<void> {
        await roomStore.syncOrdinaryRoomInfo(this.roomUUID);

        const channel = await this.rtm.init(this.userUUID, this.roomUUID);
        this.startListenCommands();

        const members = await channel.getMembers();
        this.resetUsers(await this.createUsers(members));
        this.updateInitialRoomState();

        this.updateHistory();

        channel.on("MemberJoined", async userUUID => {
            (await this.createUsers([userUUID])).forEach(this.sortOneUser, this);
        });
        channel.on("MemberLeft", userUUID => {
            for (const { group } of this.joinerGroups) {
                for (let i = 0; i < this[group].length; i++) {
                    if (this[group][i].userUUID === userUUID) {
                        runInAction(() => {
                            this[group].splice(i, 1);
                        });
                        break;
                    }
                }
            }
        });
    }

    async destroy(): Promise<void> {
        const promises: Promise<any>[] = [];

        promises.push(this.rtm.destroy());

        if (this.cloudRecording?.isRecording) {
            promises.push(this.cloudRecording.stop());
        }

        if (this.isCalling) {
            this.rtc.leave();
        }

        this.rtc.destroy();

        window.clearTimeout(this.cancelHandleChannelStatusTimeout);

        try {
            await Promise.all(promises);
        } catch (e) {
            console.error(e);
        }
    }

    private async switchRoomStatus(roomStatus: RoomStatus): Promise<void> {
        if (!this.isCreator) {
            return;
        }

        if (!this.roomInfo) {
            throw new Error("Room not ready!");
        }

        const oldRoomStatus = this.roomInfo.roomStatus;
        this.roomInfo.roomStatus = roomStatus;

        try {
            switch (roomStatus) {
                case RoomStatus.Started: {
                    await startClass(this.roomUUID);
                    break;
                }
                case RoomStatus.Paused: {
                    await pauseClass(this.roomUUID);
                    break;
                }
                case RoomStatus.Stopped: {
                    await stopClass(this.roomUUID);
                    break;
                }
                default: {
                    break;
                }
            }

            await this.rtm.sendCommand({
                type: RTMessageType.RoomStatus,
                value: roomStatus,
                keepHistory: true,
            });
        } catch (e) {
            // @TODO handle error
            console.error(e);
            runInAction(() => {
                if (this.roomInfo) {
                    this.roomInfo.roomStatus = oldRoomStatus;
                }
            });
        }
    }

    /** Add the new message to message list */
    private addMessage = (
        type: RTMessageType.ChannelMessage | RTMessageType.Notice | RTMessageType.BanText,
        value: string | boolean,
        senderID: string,
    ): void => {
        const timestamp = Date.now();
        let insertPoint = 0;
        while (
            insertPoint < this.messages.length &&
            this.messages[insertPoint].timestamp <= timestamp
        ) {
            insertPoint++;
        }
        this.messages.splice(insertPoint, 0, {
            type,
            uuid: uuidv4(),
            timestamp,
            value,
            userUUID: senderID,
        });
    };

    private async startRecording(): Promise<void> {
        this.isRecording = true;
        try {
            if (this.isCalling) {
                await this.cloudRecording.start({
                    recordingConfig: this.recordingConfig,
                });
            } else {
                await startRecordRoom(this.roomUUID);
            }
            clearTimeout();
        } catch (e) {
            console.error(e);
            runInAction(() => {
                // reset state
                this.isRecording = false;
            });
        }
    }

    private async stopRecording(): Promise<void> {
        this.isRecording = false;
        try {
            if (this.cloudRecording.isRecording) {
                await this.cloudRecording.stop();
            } else {
                await stopRecordRoom(this.roomUUID);
            }
        } catch (e) {
            console.error(e);
        }
    }

    private cancelAllHandRaising(): void {
        this.sortUsers(user => {
            if (user.isRaiseHand) {
                user.isRaiseHand = false;
            }
        });
    }

    private startListenCommands = (): void => {
        this.rtm.on(RTMessageType.ChannelMessage, (text, senderId) => {
            this.addMessage(RTMessageType.ChannelMessage, text, senderId);
        });

        this.rtm.on(RTMessageType.CancelAllHandRaising, (_value, senderId) => {
            if (senderId === this.ownerUUID && !this.isCreator) {
                this.cancelAllHandRaising();
            }
        });

        this.rtm.on(RTMessageType.RaiseHand, (isRaiseHand, senderId) => {
            this.sortUsers(user => {
                if (user.userUUID === senderId && (!isRaiseHand || !user.isSpeak)) {
                    user.isRaiseHand = isRaiseHand;
                    return false;
                }
                return true;
            });
        });

        this.rtm.on(RTMessageType.AcceptRaiseHand, ({ userUUID, accept }, senderId) => {
            if (senderId === this.ownerUUID) {
                this.sortUsers(user => {
                    if (userUUID === user.userUUID) {
                        user.isRaiseHand = false;
                        user.isSpeak = accept;
                        user.camera = false;
                        user.mic = accept;
                        return false;
                    }
                    return true;
                });
            }
        });

        this.rtm.on(RTMessageType.BanText, (isBan, senderId) => {
            if (senderId === this.ownerUUID && !this.isCreator) {
                this.addMessage(RTMessageType.BanText, isBan, this.userUUID);
            }
        });

        this.rtm.on(RTMessageType.DeviceState, ({ userUUID, camera, mic }, senderId) => {
            if (userUUID === senderId) {
                this.sortUsers(user => {
                    if (user.userUUID === userUUID) {
                        user.camera = camera;
                        user.mic = mic;
                        return false;
                    }
                    return true;
                });
            } else if (senderId === this.ownerUUID && (!camera || !mic)) {
                // creator can only turn off other's camera and mic
                this.sortUsers(user => {
                    if (user.userUUID === userUUID) {
                        user.camera = camera && user.camera;
                        user.mic = mic && user.mic;
                        return false;
                    }
                    return true;
                });
            }
        });

        this.rtm.on(RTMessageType.Speak, (configs, senderId) => {
            if (senderId !== this.ownerUUID) {
                // joiner can only turn off speaking
                configs = configs.filter(config => !config.speak && config.userUUID === senderId);
                if (configs.length <= 0) {
                    return;
                }
            }
            this.speak(configs);
        });

        this.rtm.on(RTMessageType.Notice, (text, senderId) => {
            if (senderId === this.ownerUUID) {
                this.addMessage(RTMessageType.Notice, text, senderId);
            }
        });

        this.rtm.on(RTMessageType.ClassMode, (classMode, senderId) => {
            if (senderId === this.ownerUUID) {
                this.updateClassMode(classMode);
            }
        });

        this.rtm.on(RTMessageType.RoomStatus, (roomStatus, senderId) => {
            if (senderId === this.ownerUUID) {
                this.updateRoomStatus(roomStatus);
            }
        });

        this.rtm.on(RTMessageType.RequestChannelStatus, (roomUUID, senderId) => {
            if (roomUUID === this.roomUUID) {
                type UStates = RTMEvents[RTMessageType.ChannelStatus]["uStates"];
                const uStates: UStates = {};
                const updateUStates = (user?: User | null): void => {
                    if (!user) {
                        return;
                    }
                    let result = "";
                    if (user.isSpeak) {
                        result += NonDefaultUserProp.IsSpeak;
                    }
                    if (user.isRaiseHand) {
                        result += NonDefaultUserProp.IsRaiseHand;
                    }
                    if (user.camera) {
                        result += NonDefaultUserProp.Camera;
                    }
                    if (user.mic) {
                        result += NonDefaultUserProp.Mic;
                    }
                    if (result) {
                        uStates[user.userUUID] = result as UStates[keyof UStates];
                    }
                };

                updateUStates(this.creator);
                this.speakingJoiners.forEach(updateUStates);
                this.handRaisingJoiners.forEach(updateUStates);
                this.otherJoiners.forEach(updateUStates);

                this.rtm.sendCommand({
                    type: RTMessageType.ChannelStatus,
                    value: {
                        cStatus: this.roomStatus,
                        uStates,
                    },
                    keepHistory: false,
                    peerId: senderId,
                    retry: 3,
                });
            }
        });
    };

    private speak(configs: Array<{ userUUID: string; speak: boolean }>): void {
        const configMap = new Map(configs.map(config => [config.userUUID, config]));
        this.sortUsers(user => {
            const config = configMap.get(user.userUUID);
            if (config) {
                if (config.speak) {
                    user.isSpeak = true;
                    user.isRaiseHand = false;
                } else {
                    user.isSpeak = false;
                    user.isRaiseHand = false;
                    user.camera = false;
                    user.mic = false;
                }
            }
        });
    }

    private readonly joinerGroups = [
        { group: "speakingJoiners", shouldMoveOut: (user: User): boolean => !user.isSpeak },
        { group: "handRaisingJoiners", shouldMoveOut: (user: User): boolean => !user.isRaiseHand },
        {
            group: "otherJoiners",
            shouldMoveOut: (user: User): boolean => user.isRaiseHand || user.isSpeak,
        },
    ] as const;

    /**
     * Sort users into different groups.
     * @param editUser Update a user state. Return `false` to stop traversing.
     */
    private sortUsers(editUser: (user: User) => boolean | void): void {
        const editUserAction = action("editUser", editUser);
        const unSortedUsers: User[] = [];

        let shouldStopEditUser = false;

        if (this.creator) {
            shouldStopEditUser = editUserAction(this.creator) === false;
        }

        for (const { group, shouldMoveOut } of this.joinerGroups) {
            if (shouldStopEditUser) {
                break;
            }

            for (let i = 0; i < this[group].length; i++) {
                if (shouldStopEditUser) {
                    break;
                }

                const user = this[group][i];
                shouldStopEditUser = editUserAction(user) === false;
                if (shouldMoveOut(user)) {
                    this[group].splice(i, 1);
                    i--;
                    unSortedUsers.push(user);
                }
            }
        }

        // Ssort each unsorted users into different group
        unSortedUsers.forEach(this.sortOneUser);
    }

    private resetUsers(users: User[]): void {
        this.otherJoiners.clear();
        this.speakingJoiners.clear();
        this.handRaisingJoiners.clear();
        users.forEach(this.sortOneUser, this);
    }

    private sortOneUser(user: User): void {
        if (user.userUUID === this.userUUID) {
            this.currentUser = user;
        }

        if (user.userUUID === this.ownerUUID) {
            this.creator = user;
        } else if (user.isSpeak) {
            this.speakingJoiners.push(user);
        } else if (user.isRaiseHand) {
            this.handRaisingJoiners.push(user);
        } else {
            this.otherJoiners.push(user);
        }
    }

    /**
     * There are states (e.g. user camera and mic states) that are not stored in server.
     * New joined user will request these states from other users in the room.
     */
    private async updateInitialRoomState(): Promise<void> {
        if (this.isCreator) {
            return;
        }

        // request room info from these users
        const pickedSenders: string[] = [];

        const handleChannelStatus = action(
            "handleChannelStatus",
            (
                { cStatus, uStates }: RTMEvents[RTMessageType.ChannelStatus],
                senderId: string,
            ): void => {
                if (!pickedSenders.some(userUUID => userUUID === senderId)) {
                    return;
                }
                if (this.roomInfo) {
                    this.roomInfo.roomStatus = cStatus;
                }
                this.sortUsers(user => {
                    if (uStates[user.userUUID]) {
                        for (const code of uStates[user.userUUID]) {
                            switch (code) {
                                case NonDefaultUserProp.IsSpeak: {
                                    user.isSpeak = true;
                                    break;
                                }
                                case NonDefaultUserProp.IsRaiseHand: {
                                    user.isRaiseHand = true;
                                    break;
                                }
                                case NonDefaultUserProp.Camera: {
                                    user.camera = true;
                                    break;
                                }
                                case NonDefaultUserProp.Mic: {
                                    user.mic = true;
                                    break;
                                }
                                default: {
                                    break;
                                }
                            }
                        }
                    }
                });
            },
        );

        const cancelHandleChannelStatus = (): void => {
            this.rtm.off(RTMessageType.ChannelStatus, handleChannelStatus);
        };

        this.rtm.once(RTMessageType.ChannelStatus, handleChannelStatus);
        window.clearTimeout(this.cancelHandleChannelStatusTimeout);
        this.cancelHandleChannelStatusTimeout = window.setTimeout(cancelHandleChannelStatus, 5000);

        // creator plus joiners
        const usersTotal = 1 + this.joinerTotalCount;

        if (usersTotal <= 50) {
            // in a small room, ask creator directly for info
            pickedSenders.push(this.ownerUUID);
        } else {
            // too many users. pick a random user instead.
            // @TODO pick three random users
            pickedSenders.push(this.pickRandomJoiner()?.userUUID || this.ownerUUID);
        }

        for (const senderUUID of pickedSenders) {
            try {
                await this.rtm.sendCommand({
                    type: RTMessageType.RequestChannelStatus,
                    value: this.roomUUID,
                    keepHistory: false,
                    peerId: senderUUID,
                    retry: 3,
                });
            } catch (e) {
                console.error(e);
                cancelHandleChannelStatus();
            }
        }
    }

    private async createUsers(userUUIDs: string[]): Promise<User[]> {
        const users = await usersInfo({ roomUUID: this.roomUUID, usersUUID: userUUIDs });

        return userUUIDs.map(
            (userUUID): User => ({
                userUUID,
                rtcUID: users[userUUID].rtcUID,
                avatar: users[userUUID].avatarURL,
                name: users[userUUID].name,
                camera: userUUID !== this.userUUID,
                mic: true,
                isSpeak: false,
                isRaiseHand: false,
            }),
        );
    }

    private pickRandomJoiner(): User | undefined {
        let index = Math.floor(Math.random() * this.joinerTotalCount);

        if (index < this.speakingJoiners.length) {
            return this.speakingJoiners[index];
        }

        index = index - this.speakingJoiners.length;
        if (index < this.handRaisingJoiners.length) {
            return this.handRaisingJoiners[index];
        }

        index = index - this.otherJoiners.length;
        if (index < this.otherJoiners.length) {
            return this.otherJoiners[index];
        }

        return;
    }
}

export function useClassRoomStore(
    roomUUID: string,
    ownerUUID: string,
    recordingConfig: RecordingConfig,
): ClassRoomStore {
    const [classRoomStore] = useState(
        () => new ClassRoomStore({ roomUUID, ownerUUID, recordingConfig }),
    );

    const roomTitle = classRoomStore.roomInfo?.title;
    const previousWindowTitleRef = useRef<string | null>(null);

    useEffect(() => {
        if (roomTitle !== void 0) {
            if (previousWindowTitleRef.current === null) {
                previousWindowTitleRef.current = roomTitle;
            }
            document.title = roomTitle;
        }
    }, [roomTitle]);

    useEffect(() => {
        classRoomStore.init();
        return () => {
            classRoomStore.destroy();
            // restore window title
            if (previousWindowTitleRef.current !== null) {
                document.title = previousWindowTitleRef.current;
            }
        };
        // run only on component mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return classRoomStore;
}
