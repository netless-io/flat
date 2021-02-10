import { useEffect, useState } from "react";
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
} from "../apiMiddleware/flatServer";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";
import { RoomItem, roomStore } from "./RoomStore";
import { globalStore } from "./GlobalStore";
import { NODE_ENV } from "../constants/Process";
import { useAutoRun } from "../utils/mobx";
import { User, UserStore } from "./UserStore";
import { WhiteboardStore } from "./WhiteboardStore";
import { ipcAsyncByMain } from "../utils/ipc";

export type { User } from "./UserStore";

export type RecordingConfig = Required<
    CloudRecordStartPayload["agoraData"]["clientRequest"]
>["recordingConfig"];

export class ClassRoomStore {
    readonly roomUUID: string;
    /** User uuid of the current user */
    readonly userUUID: string;
    /** RTM messages */
    messages = observable.array<RTMessage>([]);
    /** room class mode */
    classMode = ClassModeType.Lecture;
    /** is creator temporary banned room for joiner operations */
    isBan = false;
    /** is Cloud Recording on */
    isRecording = false;
    /** is RTC on */
    isCalling = false;

    readonly users: UserStore;

    readonly rtcChannelType: RtcChannelType;

    readonly rtc: RTCAPI;
    readonly rtm: RTMAPI;
    readonly cloudRecording: CloudRecording;

    readonly whiteboard: WhiteboardStore;

    /** This ownerUUID is from url params matching which cannot be trusted */
    private readonly ownerUUIDFromParams: string;

    private tempChannelStatus = observable.map<
        string,
        null | RTMEvents[RTMessageType.ChannelStatus]
    >();

    private recordingConfig: RecordingConfig;

    private _noMoreRemoteMessages = false;

    private _collectChannelStatusTimeout?: number;

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

        this.whiteboard = new WhiteboardStore({ isCreator: this.isCreator });

        makeAutoObservable<this, "_noMoreRemoteMessages" | "_collectChannelStatusTimeout">(this, {
            rtc: observable.ref,
            rtm: observable.ref,
            cloudRecording: observable.ref,
            _noMoreRemoteMessages: false,
            _collectChannelStatusTimeout: false,
        });

        this.users = new UserStore({
            roomUUID: this.roomUUID,
            ownerUUID: this.ownerUUID,
            userUUID: this.userUUID,
        });
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

    startClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Started);

    pauseClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Paused);

    resumeClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Started);

    stopClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Stopped);

    hangClass = async (): Promise<void> => {
        const configs = [...this.users.speakingJoiners, ...this.users.handRaisingJoiners].map(
            user => ({
                userUUID: user.userUUID,
                speak: false,
            }),
        );
        if (configs.length > 0) {
            await this.onSpeak(configs);
        } else {
            // for user experience
            return new Promise(resolve => {
                setTimeout(resolve, 200);
            });
        }
    };

    joinRTC = async (): Promise<void> => {
        if (this.isCalling || !this.users.currentUser) {
            return;
        }

        this.updateCalling(true);

        try {
            await this.rtc.join(this.users.currentUser.rtcUID, this.rtcChannelType);
        } catch (e) {
            console.error(e);
            this.updateCalling(false);
        }
    };

    leaveRTC = async (): Promise<void> => {
        if (!this.isCalling || !this.users.currentUser) {
            return;
        }

        this.updateCalling(false);

        try {
            if (this.isRecording) {
                await this.stopRecording();
            }
            this.rtc.leave();
        } catch (e) {
            console.error(e);
            this.updateCalling(true);
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

    updateRoomStatus = (roomStatus?: RoomStatus): void => {
        if (this.roomInfo) {
            this.roomInfo.roomStatus = roomStatus;
        }
    };

    updateHistory = async (): Promise<void> => {
        if (this._noMoreRemoteMessages) {
            return;
        }

        let messages: RTMessage[] = [];

        try {
            const oldestTimestamp =
                this.messages.length > 0 ? this.messages[0].timestamp : Date.now();
            messages = await this.rtm.fetchTextHistory(
                dateSub(oldestTimestamp, { years: 1 }).valueOf(),
                oldestTimestamp - 1,
            );
        } catch (e) {
            console.warn(e);
        }

        if (messages.length <= 0) {
            this._noMoreRemoteMessages = true;
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

        this.users.syncExtraUsersInfo(textMessages.map(msg => msg.userUUID));
    };

    /** joiner updates own camera and mic state */
    updateDeviceState = (userUUID: string, camera: boolean, mic: boolean): void => {
        if (this.userUUID === userUUID || this.isCreator) {
            this.users.updateUsers(user => {
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

    acceptRaiseHand = (userUUID: string): void => {
        if (this.isCreator) {
            this.users.updateUsers(user => {
                if (userUUID === user.userUUID) {
                    user.isRaiseHand = false;
                    user.isSpeak = true;
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

    /** When current user (who is a joiner) raises hand */
    onToggleHandRaising = (): void => {
        if (this.isCreator || this.users.currentUser?.isSpeak) {
            return;
        }
        this.users.updateUsers(user => {
            if (user.userUUID === this.userUUID) {
                user.isRaiseHand = !user.isRaiseHand;
                return false;
            }
            return true;
        });
        if (this.users.currentUser) {
            this.rtm.sendCommand({
                type: RTMessageType.RaiseHand,
                value: this.users.currentUser.isRaiseHand,
                keepHistory: true,
            });
        }
    };

    onToggleBan = async (): Promise<void> => {
        if (!this.isCreator) {
            return;
        }
        const newBanStatus = !this.isBan;
        try {
            await this.rtm.sendCommand({
                type: RTMessageType.BanText,
                value: newBanStatus,
                keepHistory: true,
            });
            this.updateBanStatus(newBanStatus);
            this.addMessage(RTMessageType.BanText, newBanStatus, this.userUUID);
        } catch (e) {
            console.error(e);
            this.updateBanStatus(!newBanStatus);
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
        this.updateSpeaking(configs, true);
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
        await this.users.initUsers(members);

        await this.joinRTC();

        await this.updateInitialRoomState();

        await this.updateHistory();

        channel.on("MemberJoined", this.users.addUser);
        channel.on("MemberLeft", this.users.removeUser);
    }

    async destroy(): Promise<void> {
        const promises: Promise<any>[] = [];

        promises.push(this.rtm.destroy());

        if (this.cloudRecording?.isRecording) {
            promises.push(this.cloudRecording.stop());
        }

        promises.push(this.leaveRTC());

        this.rtc.destroy();

        window.clearTimeout(this._collectChannelStatusTimeout);

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

            // update room status finally
            // so that the component won't unmount before sending commands
            this.updateRoomStatus(roomStatus);
        } catch (e) {
            // @TODO handle error
            console.error(e);
            this.updateRoomStatus(oldRoomStatus);
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
        this.users.updateUsers(user => {
            if (user.isRaiseHand) {
                user.isRaiseHand = false;
            }
        });
    }

    private startListenCommands = (): void => {
        this.rtm.on(RTMessageType.ChannelMessage, (text, senderId) => {
            if (!this.isBan || senderId === this.ownerUUID) {
                this.addMessage(RTMessageType.ChannelMessage, text, senderId);
                if (!this.users.cachedUsers.has(senderId)) {
                    this.users.syncExtraUsersInfo([senderId]);
                }
            }
        });

        this.rtm.on(RTMessageType.CancelAllHandRaising, (_value, senderId) => {
            if (senderId === this.ownerUUID && !this.isCreator) {
                this.cancelAllHandRaising();
            }
        });

        this.rtm.on(RTMessageType.RaiseHand, (isRaiseHand, senderId) => {
            this.users.updateUsers(user => {
                if (user.userUUID === senderId && (!isRaiseHand || !user.isSpeak)) {
                    user.isRaiseHand = isRaiseHand;
                    return false;
                }
                return true;
            });
        });

        this.rtm.on(RTMessageType.AcceptRaiseHand, ({ userUUID, accept }, senderId) => {
            if (senderId === this.ownerUUID) {
                this.users.updateUsers(user => {
                    if (userUUID === user.userUUID) {
                        user.isRaiseHand = false;
                        user.isSpeak = accept;
                        return false;
                    }
                    return true;
                });
            }
        });

        this.rtm.on(RTMessageType.BanText, (isBan, senderId) => {
            if (senderId === this.ownerUUID && !this.isCreator) {
                this.updateBanStatus(isBan);
                this.addMessage(RTMessageType.BanText, isBan, this.userUUID);
            }
        });

        this.rtm.on(RTMessageType.DeviceState, ({ userUUID, camera, mic }, senderId) => {
            if (userUUID === senderId) {
                this.users.updateUsers(user => {
                    if (user.userUUID === userUUID) {
                        user.camera = camera;
                        user.mic = mic;
                        return false;
                    }
                    return true;
                });
            } else if (senderId === this.ownerUUID && (!camera || !mic)) {
                // creator can only turn off other's camera and mic
                this.users.updateUsers(user => {
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
            this.updateSpeaking(configs, true);
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

        this.rtm.on(RTMessageType.RequestChannelStatus, (status, senderId) => {
            if (status.roomUUID === this.roomUUID) {
                this.users.updateUsers(user => {
                    if (user.userUUID === senderId) {
                        if (this.users.creator && user.userUUID === this.users.creator.userUUID) {
                            // only creator can update speaking state
                            user.isSpeak = status.user.isSpeak;
                        }
                        user.camera = status.user.camera;
                        user.mic = status.user.mic;
                        return false;
                    }
                    return true;
                });

                if (!status.userUUIDs.includes(this.userUUID)) {
                    return;
                }

                type UStates = RTMEvents[RTMessageType.ChannelStatus]["uStates"];
                const uStates: UStates = {};
                const generateUStates = (user?: User | null): void => {
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

                generateUStates(this.users.creator);
                this.users.speakingJoiners.forEach(generateUStates);
                this.users.handRaisingJoiners.forEach(generateUStates);
                this.users.otherJoiners.forEach(generateUStates);

                this.rtm.sendCommand({
                    type: RTMessageType.ChannelStatus,
                    value: {
                        ban: this.isBan,
                        rStatus: this.roomStatus,
                        rMode: this.classMode,
                        uStates,
                    },
                    keepHistory: false,
                    peerId: senderId,
                    retry: 3,
                });
            }
        });

        this.rtm.on(RTMessageType.ChannelStatus, (status, senderId) => {
            if (!this.tempChannelStatus.has(senderId)) {
                return;
            }

            runInAction(() => {
                this.tempChannelStatus.set(senderId, status);

                // @TODO support multiple requests
                this.updateChannelStatus();
            });
        });
    };

    private updateSpeaking(
        configs: Array<{ userUUID: string; speak: boolean }>,
        dropHands?: boolean,
    ): void {
        const configMap = new Map(configs.map(config => [config.userUUID, config]));
        this.users.updateUsers(user => {
            const config = configMap.get(user.userUUID);
            if (config) {
                user.isSpeak = config.speak;
                if (dropHands) {
                    user.isRaiseHand = false;
                }
            }
        });
    }

    /**
     * There are states (e.g. user camera and mic states) that are not stored in server.
     * New joined user will request these states from other users in the room.
     */
    private async updateInitialRoomState(): Promise<void> {
        if (!this.users.currentUser) {
            if (NODE_ENV === "development") {
                console.warn(`updateInitialRoomState: current user not exits`);
            }
            return;
        }

        this.tempChannelStatus.clear();
        window.clearTimeout(this._collectChannelStatusTimeout);

        // request room info from these users
        const pickedSenders: string[] = [];

        if (this.users.totalUserCount >= 2) {
            if (this.users.totalUserCount <= 50 && this.users.creator && !this.isCreator) {
                // in a small room, ask creator directly for info
                pickedSenders.push(this.users.creator.userUUID);
            } else {
                // too many users. pick a random user instead.
                // @TODO pick three random users
                pickedSenders.push(this.users.pickRandomJoiner()?.userUUID || this.ownerUUID);
            }
        }

        for (const senderUUID of pickedSenders) {
            this.tempChannelStatus.set(senderUUID, null);
        }

        try {
            await this.rtm.sendCommand({
                type: RTMessageType.RequestChannelStatus,
                value: {
                    roomUUID: this.roomUUID,
                    userUUIDs: pickedSenders,
                    user: {
                        name: globalStore.wechat?.name || "",
                        isSpeak: this.users.currentUser.isSpeak,
                        mic: this.users.currentUser.mic,
                        camera: this.users.currentUser.camera,
                    },
                },
                keepHistory: false,
            });

            // @TODO support multiple senders
            // this._collectChannelStatusTimeout = window.setTimeout(() => {
            //     // collect status anyway after 1s
            //     this.updateChannelStatus();
            // }, 1000);
        } catch (e) {
            console.error(e);
        }
    }

    // makeAutoObservable some how doesn't work in autorun
    private updateCalling = action("updateCalling", (isCalling: boolean): void => {
        this.isCalling = isCalling;
    });

    private updateBanStatus = (isBan: boolean): void => {
        this.isBan = isBan;
    };

    private updateChannelStatus(): void {
        const status = [...this.tempChannelStatus.values()].find(Boolean);

        if (!status) {
            return;
        }

        if (this.roomInfo) {
            this.roomInfo.roomStatus = status.rStatus;
        }

        this.classMode = status.rMode;

        this.updateBanStatus(status.ban);

        this.users.updateUsers(user => {
            if (user.userUUID !== this.userUUID && status.uStates[user.userUUID]) {
                for (const code of status.uStates[user.userUUID]) {
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

        this.tempChannelStatus.clear();
        window.clearTimeout(this._collectChannelStatusTimeout);
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

    useAutoRun(() => {
        const title = classRoomStore.roomInfo?.title;
        if (title) {
            document.title = title;
            ipcAsyncByMain("set-title", {
                title: document.title,
            });
        }
    });

    useEffect(() => {
        classRoomStore.init();
        return () => {
            classRoomStore.destroy();
        };
        // run only on component mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return classRoomStore;
}
