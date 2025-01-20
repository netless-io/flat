import type { Storage } from "@netless/fastboard";

import { SideEffectManager } from "side-effect-manager";
import { action, autorun, makeAutoObservable, observable, reaction, runInAction } from "mobx";
import {
    pauseClass,
    startClass,
    stopClass,
    generateRTCToken,
    RoomStatus,
    RoomType,
    checkRTMCensor,
} from "@netless/flat-server-api";
import { FlatI18n } from "@netless/flat-i18n";
import { errorTips, message } from "flat-components";
import { RoomItem, roomStore } from "../room-store";
import { User, UserStore } from "../user-store";
import { WhiteboardStore } from "../whiteboard-store";
import { globalStore, type AIInfo } from "../global-store";
import { ClassModeType, RoomStatusLoadingType } from "./constants";
import { ChatStore } from "./chat-store";
import {
    IServiceRecording,
    IServiceShareScreenInfo,
    IServiceTextChat,
    IServiceVideoChat,
    IServiceVideoChatMode,
    IServiceVideoChatRole,
    IServiceWhiteboard,
} from "@netless/flat-services";
import { preferencesStore } from "../preferences-store";
import { sampleSize } from "lodash-es";
import { format } from "date-fns";
import { AIChatStore } from "./ai-chat-store";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

export * from "./constants";
export * from "./chat-store";

export interface ClassroomStoreConfig {
    roomUUID: string;
    ownerUUID: string;
    rtc: IServiceVideoChat;
    rtm: IServiceTextChat;
    whiteboard: IServiceWhiteboard;
    recording: IServiceRecording;
    isAIClass: boolean;
}

export type DeviceStateStorageState = Record<string, { camera: boolean; mic: boolean }>;
export type ClassroomStorageState = {
    ban: boolean;
    raiseHandUsers: string[];
    shareScreen: boolean;
    aiInfo?: AIInfo;
};
export type OnStageUsersStorageState = Record<string, boolean>;
export type WhiteboardStorageState = Record<string, boolean>;
export type UserWindowsStorageState = {
    grid: null | string[];
};
// stored in UserWindowsStorageState too, but TypeScript does not support union records
export type UserWindow = {
    x: number;
    y: number;
    width: number;
    height: number;
    z: number;
};

export class ClassroomStore {
    private readonly sideEffect = new SideEffectManager();
    private readonly rewardCooldown = new Map<string, number>();

    // If it is `true`, the stop-recording is triggered by the user, do not show the message.
    private recordingEndSentinel = false;

    public readonly roomUUID: string;
    public readonly ownerUUID: string;
    /** User uuid of the current user */
    public readonly userUUID: string;
    /** room class mode */
    public classMode: ClassModeType;
    /** is creator temporary banned room for joiner operations */
    public isBan = false;
    /** is Cloud Recording on */
    public isRecording = false;
    /** is toggling cloud recording */
    public isRecordingLoading = false;
    /** is user login on other device */
    public isRemoteLogin = false;
    /** is being requested for turning on device */
    public isRequestingCamera = false;
    public isRequestingMic = false;

    public isCloudStoragePanelVisible = false;
    public isHandRaisingPanelVisible = false;
    public isUsersPanelVisible = false;

    public isDraggingAvatar = false;
    public droppingUserUUID: string | null = null;

    public hoveringUserUUID: string | null = null;

    public roomStatusLoading = RoomStatusLoadingType.Null;

    /** is RTC joined room */
    public isJoinedRTC = false;

    /** is current user sharing screen */
    public isScreenSharing = false;
    /** is other users sharing screen */
    public isRemoteScreenSharing = false;
    /** (electron only) */
    public shareScreenInfo: IServiceShareScreenInfo[] = [];

    public selectedScreenInfo: IServiceShareScreenInfo | null = null;
    public shareScreenWithAudio = false;
    public shareScreenAudioDeviceName = "";

    public shareScreenPickerVisible = false;

    public adminMessage = "";
    public expireAt = 0;

    public networkQuality = {
        delay: 0,
        uplink: 0,
        downlink: 0,
    };

    /** will never be empty array [] */
    public userWindowsGrid: string[] | null = null;
    public readonly userWindows = observable.map<string, UserWindow>();
    public readonly userWindowsPortal = observable.map<string, HTMLDivElement>();

    public deviceStateStorage?: Storage<DeviceStateStorageState>;
    public classroomStorage?: Storage<ClassroomStorageState>;
    public onStageUsersStorage?: Storage<OnStageUsersStorageState>;
    /** users that can operate the whiteboard */
    public whiteboardStorage?: Storage<WhiteboardStorageState>;
    public userWindowsStorage?: Storage<UserWindowsStorageState>;

    public readonly users: UserStore;

    public readonly onStageUserUUIDs = observable.array<string>();

    public readonly rtc: IServiceVideoChat;
    public readonly rtm: IServiceTextChat;
    public readonly chatStore: ChatStore;
    public readonly whiteboardStore: WhiteboardStore;
    public readonly recording: IServiceRecording;
    public aiChatStore?: AIChatStore;

    public isAIRoom = false;
    public isAIExisted = false;
    public isHasAIUser = false;
    public rtcUID?: string;

    public constructor(config: ClassroomStoreConfig) {
        if (!globalStore.userUUID) {
            throw new Error("Missing user uuid");
        }

        (window as any).classroomStore = this;

        this.roomUUID = config.roomUUID;
        this.ownerUUID = config.ownerUUID;
        this.userUUID = globalStore.userUUID;
        this.classMode = ClassModeType.Lecture;
        this.rtc = config.rtc;
        this.rtm = config.rtm;
        this.recording = config.recording;
        this.isAIRoom = config.isAIClass;

        this.chatStore = new ChatStore({
            roomUUID: this.roomUUID,
            ownerUUID: this.ownerUUID,
            rtm: this.rtm,
            isShowUserGuide: globalStore.isShowGuide,
        });

        this.users = new UserStore({
            roomUUID: this.roomUUID,
            ownerUUID: this.ownerUUID,
            userUUID: this.userUUID,
            isInRoom: userUUID => this.rtm.members.has(userUUID) || config.whiteboard.has(userUUID),
        });

        this.whiteboardStore = new WhiteboardStore({
            isCreator: this.isCreator,
            isWritable: this.isCreator,
            getRoomType: () => this.roomInfo?.roomType || RoomType.BigClass,
            whiteboard: config.whiteboard,
            onDrop: this.onDrop,
        });

        makeAutoObservable<this, "sideEffect" | "rewardCooldown" | "recordingEndSentinel">(this, {
            rtc: observable.ref,
            rtm: observable.ref,
            sideEffect: false,
            rewardCooldown: false,
            recordingEndSentinel: false,
            deviceStateStorage: false,
            classroomStorage: false,
            onStageUsersStorage: false,
            shareScreenInfo: observable.ref,
        });

        this.sideEffect.addDisposer(
            this.recording.$Val.isRecording$.subscribe(isRecording => {
                runInAction(() => {
                    this.isRecording = isRecording;
                });
            }),
        );

        this.sideEffect.addDisposer(
            reaction(
                () => this.isRecording,
                (isRecording: boolean) => {
                    if (isRecording) {
                        void message.success(FlatI18n.t("start-recording"));
                    } else if (!this.recordingEndSentinel) {
                        void message.info(FlatI18n.t("recording-end"));
                    }
                },
            ),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on(
                "remote-login",
                action("remote-login", () => {
                    this.isRemoteLogin = true;
                }),
            ),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on("admin-message", ({ text }) => {
                this.handleAdminMessage(text);
            }),
        );

        if (!this.isCreator) {
            this.sideEffect.addDisposer(
                this.rtm.events.on("update-room-status", event => {
                    if (event.roomUUID === this.roomUUID && event.senderID === this.ownerUUID) {
                        this.updateRoomStatus(event.status);
                    }
                }),
            );

            this.sideEffect.addDisposer(
                this.rtm.events.on("request-device", event => {
                    if (event.roomUUID === this.roomUUID && event.senderID === this.ownerUUID) {
                        this.toggleRequestingDevice(
                            event.deviceState.camera,
                            event.deviceState.mic,
                        );
                    }
                }),
            );

            this.sideEffect.addDisposer(
                this.rtm.events.on("notify-device-off", event => {
                    if (event.roomUUID === this.roomUUID && event.senderID === this.ownerUUID) {
                        if (event.deviceState.camera === false) {
                            message.info(FlatI18n.t("teacher-has-turn-off-camera"));
                        }
                        if (event.deviceState.mic === false) {
                            message.info(FlatI18n.t("teacher-has-turn-off-mic"));
                        }
                    }
                }),
            );
        }

        if (this.isCreator) {
            this.sideEffect.addDisposer(
                this.rtm.events.on("raise-hand", message => {
                    if (this.classroomStorage?.isWritable && this.roomUUID === message.roomUUID) {
                        const isRaisingHand = this.classroomStorage.state.raiseHandUsers.some(
                            userUUID => userUUID === message.userUUID,
                        );
                        if (message.raiseHand) {
                            if (!isRaisingHand) {
                                this.classroomStorage.setState({
                                    raiseHandUsers: [
                                        ...this.classroomStorage.state.raiseHandUsers,
                                        message.userUUID,
                                    ],
                                });
                            }
                        } else {
                            if (isRaisingHand) {
                                this.classroomStorage.setState({
                                    raiseHandUsers:
                                        this.classroomStorage.state.raiseHandUsers.filter(
                                            userUUID => userUUID !== message.userUUID,
                                        ),
                                });
                            }
                        }
                    }
                }),
            );
            this.sideEffect.addDisposer(
                this.rtm.events.on("request-device-response", event => {
                    if (event.roomUUID === this.roomUUID) {
                        const name = this.users.cachedUsers.get(event.userUUID)?.name;
                        if (event.deviceState.camera === false) {
                            message.info(FlatI18n.t("refuse-to-turn-on-camera", { name }));
                        }
                        if (event.deviceState.mic === false) {
                            message.info(FlatI18n.t("refuse-to-turn-on-mic", { name }));
                        }
                    }
                }),
            );
            this.sideEffect.addDisposer(
                reaction(
                    () => this.isScreenSharing || this.isRemoteScreenSharing,
                    (shareScreen: boolean) => {
                        if (this.classroomStorage?.isWritable) {
                            this.classroomStorage.setState({
                                shareScreen,
                            });
                        }
                    },
                ),
            );
        }
    }

    public get roomType(): RoomType {
        return this.roomInfo?.roomType ?? RoomType.BigClass;
    }

    public get roomInfo(): RoomItem | undefined {
        return roomStore.rooms.get(this.roomUUID);
    }

    public get isCreator(): boolean {
        return this.ownerUUID === this.userUUID;
    }

    public get roomStatus(): RoomStatus {
        if (this.whiteboardStore.isKicked) {
            return RoomStatus.Stopped;
        }
        return this.roomInfo?.roomStatus ?? RoomStatus.Idle;
    }

    public get firstOnStageUser(): User | undefined {
        return this.onStageUserUUIDs.length > 0
            ? this.users.cachedUsers.get(this.onStageUserUUIDs[0])
            : undefined;
    }

    public get offlineJoiners(): User[] {
        const result: User[] = [];
        for (const user of this.users.cachedUsers.values()) {
            if (this.onStageUserUUIDs.includes(user.userUUID) && user.hasLeft) {
                result.push(user);
            }
        }
        return result;
    }

    public get userWindowsMode(): "normal" | "maximized" {
        return this.userWindowsGrid ? "maximized" : "normal";
    }

    private emptyArrayAsNull<T>(a: T[] | null): T[] | null {
        return a && a.length > 0 ? a : null;
    }

    public async init(): Promise<void> {
        await roomStore.syncOrdinaryRoomInfo(this.roomUUID);

        const fastboard = await this.whiteboardStore.joinWhiteboardRoom();

        const deviceStateStorage = fastboard.syncedStore.connectStorage<DeviceStateStorageState>(
            "deviceState",
            {},
        );
        const classroomStorage = fastboard.syncedStore.connectStorage<ClassroomStorageState>(
            "classroom",
            {
                ban: false,
                raiseHandUsers: [],
                shareScreen: false,
                aiInfo: undefined,
            },
        );
        const onStageUsersStorage = fastboard.syncedStore.connectStorage<OnStageUsersStorageState>(
            "onStageUsers",
            {},
        );
        const whiteboardStorage = fastboard.syncedStore.connectStorage<WhiteboardStorageState>(
            "whiteboard",
            {},
        );
        const userWindowsStorage = fastboard.syncedStore.connectStorage<UserWindowsStorageState>(
            "userWindows",
            { grid: null },
        );
        this.deviceStateStorage = deviceStateStorage;
        this.classroomStorage = classroomStorage;
        this.onStageUsersStorage = onStageUsersStorage;
        this.whiteboardStorage = whiteboardStorage;
        this.userWindowsStorage = userWindowsStorage;

        if (this.roomType === RoomType.OneToOne && this.classroomStorage.state.aiInfo) {
            if (!this.isAIRoom) {
                if (globalStore.aiInfo) {
                    globalStore.setAIInfo(undefined);
                }
                this.isAIRoom = true;
            }
        }

        if (this.isAIRoom && globalStore.rtcUID) {
            if (globalStore.aiInfo) {
                this.setAiInfo(globalStore.aiInfo);
                globalStore.setAIInfo(undefined);
            }
            if (this.classroomStorage?.state.aiInfo) {
                const aiInfo = this.classroomStorage?.state.aiInfo;
                this.aiChatStore = new AIChatStore({
                    aiInfo,
                    rtcUID: globalStore.rtcUID,
                    roomUUID: this.roomUUID,
                    ownerUUID: this.ownerUUID,
                });
                this.aiChatStore.onNewMessage = message => {
                    if (this.isRecording) {
                        fastboard.syncedStore.dispatchEvent("new-message", message);
                    }
                };
                try {
                    const bol = await this.aiChatStore.start();
                    this.isAIExisted = bol;
                } catch (error) {
                    throw new Error(error.message);
                }
            }
            this.rtcUID = globalStore.rtcUID?.toString();
        }

        await this.initRTC();

        if (this.aiChatStore) {
            this.rtc.listenAIRtcStreamMessage(
                this.aiChatStore.handleStreamMsgChunk.bind(this.aiChatStore),
                this.handleUserJoinedChunk.bind(this),
                this.aiChatStore.aiAudioTrackHandler.bind(this),
            );
        }

        await this.rtm.joinRoom({
            roomUUID: this.roomUUID,
            ownerUUID: this.ownerUUID,
            uid: this.userUUID,
            token: globalStore.rtmToken,
        });

        const onStageUsers = Object.keys(onStageUsersStorage.state).filter(
            userUUID => onStageUsersStorage.state[userUUID],
        );
        const members = [...this.rtm.members];
        await this.users.initUsers(members, [this.ownerUUID, this.userUUID, ...onStageUsers]);
        const owner = this.users.cachedUsers.get(this.ownerUUID);
        // update owner info in room store, it will use that to render the users panel
        roomStore.updateRoom(this.roomUUID, this.ownerUUID, {
            ownerName: owner?.name,
            ownerAvatarURL: owner?.avatar,
        });

        const user = this.users.cachedUsers.get(this.userUUID);
        if (user) {
            void this.rtm.sendRoomCommand("enter", {
                roomUUID: this.roomUUID,
                userUUID: user.userUUID,
                userInfo: {
                    name: user.name,
                    avatarURL: user.avatar,
                    rtcUID: +user.rtcUID || 0,
                },
                peers: sampleSize(members, 3),
            });
        }

        this.sideEffect.addDisposer(
            this.rtm.events.on("enter", ({ userUUID: senderID, userInfo, peers }) => {
                if (senderID === this.userUUID) {
                    // ignore self enter message
                    return;
                }
                if (process.env.DEV) {
                    console.log(`[rtm] ${senderID} is entering room with his info:`, userInfo);
                }
                this.users.cacheUserIfNeeded(senderID, userInfo);
                if (peers && peers.includes(this.userUUID)) {
                    this.sendUsersInfoToPeer(senderID);
                    if (process.env.DEV) {
                        console.log(`[rtm] send local users info to peer ${senderID}`);
                    }
                }
            }),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on("users-info", ({ userUUID: senderID, users }) => {
                let count = 0;
                for (const userUUID in users) {
                    if (this.users.cacheUserIfNeeded(userUUID, users[userUUID])) {
                        count++;
                    }
                }
                if (process.env.DEV) {
                    console.log(`[rtm] received users info from ${senderID}: %d rows`, count);
                }
            }),
        );

        if (this.isCreator) {
            this.updateDeviceState(
                this.userUUID,
                Boolean(preferencesStore.autoCameraOn),
                Boolean(preferencesStore.autoMicOn),
            );
        } else {
            this.whiteboardStore.updateWritable(
                Boolean(
                    onStageUsersStorage.state[this.userUUID] ||
                        whiteboardStorage.state[this.userUUID],
                ),
            );
            this.whiteboardStore.updateAllowDrawing(whiteboardStorage.state[this.userUUID]);
        }

        this.updateIsBan(classroomStorage.state.ban);

        this.chatStore.onNewMessage = message => {
            if (this.isRecording) {
                fastboard.syncedStore.dispatchEvent("new-message", message);
            }
            this.users.flushLazyUsers([message.senderID]).catch(console.error);
        };

        const raiseHandUsers = new Set<string>();
        const updateRaiseHandUsers = (userUUIDs: ReadonlyArray<string> = []): void => {
            raiseHandUsers.clear();
            userUUIDs.forEach(userUUID => {
                raiseHandUsers.add(userUUID);
            });
        };
        updateRaiseHandUsers(classroomStorage.state.raiseHandUsers);

        this.users.updateUsers(user => {
            if (user.userUUID === this.ownerUUID || onStageUsersStorage.state[user.userUUID]) {
                user.isSpeak = true;
                user.isRaiseHand = false;
                const deviceState = deviceStateStorage.state[user.userUUID];
                if (deviceState) {
                    user.camera = deviceState.camera;
                    user.mic = deviceState.mic;
                }
            } else {
                user.isSpeak = false;
                user.mic = false;
                user.camera = false;
                user.isRaiseHand = raiseHandUsers.has(user.userUUID);
            }
            user.wbOperate = !!whiteboardStorage.state[user.userUUID];
        });

        const refreshUsers = (userUUIDs: string[]): void => {
            const set = new Set(userUUIDs);
            this.users.updateUsers(user => {
                if (!set.has(user.userUUID)) {
                    return true;
                }
                if (user.userUUID === this.ownerUUID || onStageUsersStorage.state[user.userUUID]) {
                    user.isSpeak = true;
                    user.wbOperate = !!whiteboardStorage.state[user.userUUID];
                    user.isRaiseHand = false;
                    const deviceState = deviceStateStorage.state[user.userUUID];
                    if (deviceState) {
                        user.camera = deviceState.camera;
                        user.mic = deviceState.mic;
                    } else {
                        user.camera = false;
                        user.mic = false;
                    }
                    set.delete(user.userUUID);
                    if (set.size === 0) {
                        return false;
                    }
                }
                // not on stage, but has whiteboard access
                if (whiteboardStorage.state[user.userUUID]) {
                    user.wbOperate = true;
                    set.delete(user.userUUID);
                    if (set.size === 0) {
                        return false;
                    }
                }
                return true;
            });
        };

        this.sideEffect.addDisposer(
            this.rtm.events.on("member-joined", async ({ userUUID }) => {
                await this.users.addUser(userUUID, this.isUsersPanelVisible);
                refreshUsers([userUUID]);
            }),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on("member-left", ({ userUUID }) => {
                this.users.removeUser(userUUID);
            }),
        );

        this.sideEffect.addDisposer(
            this.whiteboardStore.whiteboard.events.on("members", async (userUUIDs: string[]) => {
                userUUIDs = userUUIDs.filter(userUUID => !this.users.cachedUsers.has(userUUID));
                if (userUUIDs.length > 0) {
                    for (const userUUID of userUUIDs) {
                        await this.users.addUser(userUUID, this.isUsersPanelVisible);
                    }
                    refreshUsers(userUUIDs);
                }
            }),
        );

        this.sideEffect.addDisposer(
            classroomStorage.on("stateChanged", diff => {
                if (diff.raiseHandUsers) {
                    updateRaiseHandUsers(diff.raiseHandUsers.newValue);
                    this.users.updateUsers(user => {
                        user.isRaiseHand = raiseHandUsers.has(user.userUUID);
                    });
                }
                if (diff.ban) {
                    this.updateIsBan(diff.ban.newValue);
                    if (this.isCreator) {
                        this.rtm.sendRoomCommand("ban", {
                            roomUUID: this.roomUUID,
                            status: diff.ban.newValue,
                        });
                    }
                }
                // if (diff.aiInfo) {
                //     globalStore.setAIInfo(diff.aiInfo.newValue);
                // }
            }),
        );

        const updateUserStagingState = async (): Promise<void> => {
            const wasJoinerOnStage = this.onStageUserUUIDs.includes(this.userUUID);
            const onStageUsers = Object.keys(onStageUsersStorage.state).filter(
                userUUID => onStageUsersStorage.state[userUUID],
            );
            await this.users.flushLazyUsers(onStageUsers);
            runInAction(() => {
                this.onStageUserUUIDs.replace(onStageUsers);
            });
            this.users.updateUsers(user => {
                if (user.userUUID === this.ownerUUID) {
                    return;
                }
                if (onStageUsersStorage.state[user.userUUID]) {
                    user.isSpeak = true;
                    user.isRaiseHand = false;
                    const deviceState = deviceStateStorage.state[user.userUUID];
                    if (deviceState) {
                        user.camera = deviceState.camera;
                        user.mic = deviceState.mic;
                    } else {
                        user.camera = false;
                        user.mic = false;
                    }
                } else {
                    user.isSpeak = false;
                    user.mic = false;
                    user.camera = false;
                }
            });

            if (!this.isCreator) {
                const isJoinerOnStage = Boolean(onStageUsersStorage.state[this.userUUID]);
                this.whiteboardStore.updateWritable(
                    Boolean(isJoinerOnStage || whiteboardStorage.state[this.userUUID]),
                );
                this.whiteboardStore.updateAllowDrawing(whiteboardStorage.state[this.userUUID]);

                // @FIXME add reliable way to ensure writable is set
                if (isJoinerOnStage && !fastboard.syncedStore.isRoomWritable) {
                    await new Promise<void>(resolve => {
                        const disposer = fastboard.syncedStore.addRoomWritableChangeListener(
                            isWritable => {
                                if (isWritable) {
                                    disposer();
                                    resolve();
                                }
                            },
                        );
                    });
                }

                if (!wasJoinerOnStage && isJoinerOnStage) {
                    this.updateDeviceState(
                        this.userUUID,
                        preferencesStore.autoCameraOn,
                        preferencesStore.autoMicOn,
                    );
                }

                if (wasJoinerOnStage !== isJoinerOnStage) {
                    message.info(FlatI18n.t(isJoinerOnStage ? "stage-on" : "stage-off"));
                }
            }
        };
        updateUserStagingState();

        const initialUserWindows = new Map<string, UserWindow>();
        for (const key in userWindowsStorage.state) {
            if (key !== "grid") {
                const userWindow: UserWindow | null = (userWindowsStorage.state as any)[key];
                if (userWindow) {
                    initialUserWindows.set(key, userWindow);
                }
            }
        }
        runInAction(() => {
            this.userWindowsGrid = this.emptyArrayAsNull(userWindowsStorage.state.grid);
            this.userWindows.replace(initialUserWindows);
        });

        this.sideEffect.addDisposer(onStageUsersStorage.on("stateChanged", updateUserStagingState));
        this.sideEffect.addDisposer(
            whiteboardStorage.on("stateChanged", diff => {
                this.users.updateUsers(user => {
                    user.wbOperate =
                        user.userUUID === this.ownerUUID ||
                        !!whiteboardStorage.state[user.userUUID];
                });
                this.whiteboardStore.updateWritable(
                    Boolean(
                        this.isCreator ||
                            onStageUsersStorage.state[this.userUUID] ||
                            whiteboardStorage.state[this.userUUID],
                    ),
                );
                this.whiteboardStore.updateAllowDrawing(
                    this.isCreator || whiteboardStorage.state[this.userUUID],
                );
                for (const userUUID in diff) {
                    const user = this.users.cachedUsers.get(userUUID);
                    const enabled = diff[userUUID]?.newValue;
                    if (this.userUUID === userUUID) {
                        if (enabled) {
                            message.info(FlatI18n.t("granted-whiteboard-access"));
                        } else {
                            message.info(FlatI18n.t("revoked-whiteboard-access"));
                        }
                    } else if (user && this.isCreator) {
                        if (enabled) {
                            message.info(
                                FlatI18n.t("grant-whiteboard-access", { name: user.name }),
                            );
                        } else {
                            message.info(
                                FlatI18n.t("revoke-whiteboard-access", { name: user.name }),
                            );
                        }
                    }
                }
            }),
        );
        this.sideEffect.addDisposer(
            userWindowsStorage.on("stateChanged", diff => {
                runInAction(() => {
                    for (const key in diff) {
                        if (key === "grid") {
                            this.userWindowsGrid = this.emptyArrayAsNull(diff[key]!.newValue);
                        } else {
                            const userWindow: UserWindow | undefined = (diff as any)[key].newValue;
                            if (userWindow) {
                                this.userWindows.set(key, userWindow);
                            } else {
                                this.userWindows.delete(key);
                            }
                        }
                    }
                });
            }),
        );

        this.sideEffect.addDisposer(
            autorun(() => {
                const users: Array<{ uid: string; avatar: string; isOwner: boolean }> = [];
                const owner = this.users.cachedUsers.get(this.ownerUUID);
                if (owner) {
                    users.push({
                        uid: owner.rtcUID,
                        avatar: owner.avatar,
                        isOwner: true,
                    });
                }
                this.onStageUserUUIDs.forEach(userUUID => {
                    const user = this.users.cachedUsers.get(userUUID);
                    if (user) {
                        users.push({
                            uid: user.rtcUID,
                            avatar: user.avatar,
                            isOwner: userUUID === this.ownerUUID,
                        });
                    }
                });
                // sort creator to the first, then small uid to large uid
                users.sort((a, b) =>
                    a.isOwner ? -1 : b.isOwner ? 1 : (+a.uid | 0) - (+b.uid | 0),
                );
                this.updateRecordingLayout(users);
            }),
        );

        this.sideEffect.addDisposer(
            deviceStateStorage.on("stateChanged", () => {
                this.users.updateUsers(user => {
                    const deviceState = deviceStateStorage.state[user.userUUID];
                    if (deviceState) {
                        user.camera = deviceState.camera;
                        user.mic = deviceState.mic;
                    } else {
                        user.mic = false;
                        user.camera = false;
                    }
                });
                // When there's no active stream in the channel, the recording service
                // stops automatically after `maxIdleTime`.
                if (this.isRecording) {
                    let hasStream = false;
                    for (const userUUID in deviceStateStorage.state) {
                        const deviceState = deviceStateStorage.state[userUUID];
                        if (deviceState.camera || deviceState.mic) {
                            hasStream = true;
                            break;
                        }
                    }
                    if (!hasStream) {
                        this.sideEffect.setTimeout(
                            () => {
                                if (this.isRecording) {
                                    this.recording.checkIsRecording().catch(console.warn);
                                }
                            },
                            // Roughly 5 minutes later, see cloud-recording.ts.
                            5 * 61 * 1000,
                        );
                    }
                }
            }),
        );

        if (this.roomType === RoomType.OneToOne) {
            if (this.isCreator && this.roomStatus === RoomStatus.Idle) {
                void this.startClass();
            }
        }

        if (
            (this.roomType === RoomType.OneToOne || this.roomType === RoomType.SmallClass) &&
            !this.isCreator &&
            !onStageUsersStorage.state[this.userUUID] &&
            this.assertStageNotFull(false) &&
            !globalStore.wasOnStage(this.roomUUID)
        ) {
            globalStore.pushOnStageRoomUUID(this.roomUUID);
            if (!fastboard.syncedStore.isRoomWritable) {
                this.whiteboardStore.updateWritable(true);
                // @FIXME add reliable way to ensure writable is set
                await new Promise<void>(resolve => {
                    const disposer = fastboard.syncedStore.addRoomWritableChangeListener(
                        isWritable => {
                            if (isWritable) {
                                disposer();
                                resolve();
                            }
                        },
                    );
                });
            }
            this.onStageUsersStorage.setState({ [this.userUUID]: true });
        }

        if (this.isCreator) {
            await this.recording.joinRoom({
                roomID: this.roomUUID,
                classroomType: this.roomType,
            });

            if (preferencesStore.autoRecording && !this.isRecording) {
                await this.toggleRecording();
            }
        }
    }

    // @TODO: use RTM 2.0 and get users info from peer properties
    private sendUsersInfoToPeer(_userUUID: string): void {
        // @TODO: disabled for now, be cause RTM 1.0 has a limit of 1KB per message
        //
        // const users: Record<string, UserInfo> = {};
        //
        // Filter out initialized users (whose rtcUID is not null)
        // for (const user of this.users.cachedUsers.values()) {
        //     if (user.rtcUID) {
        //         users[user.userUUID] = {
        //             rtcUID: +user.rtcUID || 0,
        //             name: user.name,
        //             avatarURL: user.avatar,
        //         };
        //     }
        // }
        // void this.rtm.sendPeerCommand(
        //     "users-info",
        //     {
        //         roomUUID: this.roomUUID,
        //         users,
        //     },
        //     userUUID,
        // );
    }

    public async destroy(): Promise<void> {
        this.sideEffect.flushAll();
        (window as any).classroomStore = null;

        await this.stopRecording();

        this.deviceStateStorage = undefined;
        this.onStageUsersStorage = undefined;
        this.classroomStorage = undefined;
        this.whiteboardStorage = undefined;
        this.userWindowsStorage = undefined;
    }

    public startClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Started);

    public pauseClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Paused);

    public stopClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Stopped);

    public hangClass = async (): Promise<void> => {
        // delay resolve for better UX
        if (this.isAIRoom) {
            await this.aiChatStore?.stop();
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    };

    public toggleCloudStoragePanel = (visible: boolean): void => {
        this.isCloudStoragePanelVisible = visible;
    };

    public toggleUsersPanel = (visible = !this.isUsersPanelVisible): void => {
        this.isUsersPanelVisible = visible;
        // fetch lazy loaded users when the users panel is opened
        if (visible) {
            this.users.flushLazyUsers().catch(console.error);
        }
    };

    public onDragStart = (): void => {
        this.isDraggingAvatar = true;
    };

    public onDragEnd = (): void => {
        this.isDraggingAvatar = false;
    };

    public getPortal = (userUUID: string): HTMLDivElement | undefined => {
        return this.userWindowsPortal.get(userUUID);
    };

    public setPortal = (userUUID: string, portal: HTMLDivElement | null | undefined): void => {
        if (portal) {
            this.userWindowsPortal.set(userUUID, portal);
        } else {
            this.userWindowsPortal.delete(userUUID);
        }
    };

    public windowedUserUUIDs = (): string[] => {
        if (!this.userWindowsStorage) {
            return [];
        }
        const windows = this.userWindowsStorage.state as unknown as Record<string, UserWindow>;
        const result: string[] = [];
        for (const key in windows) {
            if (key !== "grid" && windows[key]) {
                result.push(key);
            }
        }
        return result;
    };

    public maxZOfUserWindows = (exclude?: string): number => {
        if (!this.userWindowsStorage) {
            return 0;
        }
        const windows = this.userWindowsStorage.state as unknown as Record<string, UserWindow>;
        let maxZ = 0;
        for (const key in windows) {
            if (key !== "grid" && key !== exclude && windows[key]) {
                maxZ = Math.max(maxZ, windows[key].z);
            }
        }
        return maxZ;
    };

    public userHasLeft = (userUUID: string): boolean => {
        return this.users.cachedUsers.get(userUUID)?.hasLeft ?? true;
    };

    public toggleUserWindowsMode = (mode?: "normal" | "maximized"): void => {
        if (this.isCreator && this.userWindowsStorage) {
            const targetMode = mode || (this.userWindowsMode === "normal" ? "maximized" : "normal");
            if (targetMode === "normal") {
                this.userWindowsStorage.setState({ grid: null });
            } else {
                this.userWindowsStorage.setState({ grid: this.windowedUserUUIDs() });
            }
        }
    };

    public minimizeAllUserWindows = (): void => {
        if (this.isCreator && this.userWindowsStorage) {
            this.userWindowsStorage.resetState();
        }
    };

    public createAvatarWindow = (userUUID: string, window: Omit<UserWindow, "z">): void => {
        if (this.isCreator && this.userWindowsStorage) {
            if (this.emptyArrayAsNull(this.userWindowsStorage.state.grid)) {
                this.createMaximizedAvatarWindow(userUUID);
            } else {
                const maxZ = this.maxZOfUserWindows();
                this.userWindowsStorage.setState({ [userUUID]: { ...window, z: maxZ + 1 } });
            }
        }
    };

    public createMaximizedAvatarWindow = (userUUID: string): void => {
        if (this.isCreator && this.userWindowsStorage) {
            let grid = this.userWindowsStorage.state.grid;
            if (!grid || grid.length === 0) {
                grid = this.windowedUserUUIDs();
            }
            if (!grid.includes(userUUID)) {
                grid = [...grid, userUUID];
            }
            this.userWindowsStorage.setState({ grid });
        }
    };

    private isWindowEqual(a: UserWindow, b: UserWindow): boolean {
        return (
            a.z === b.z &&
            Math.abs(a.x - b.x) < 1e-3 &&
            Math.abs(a.y - b.y) < 1e-3 &&
            Math.abs(a.width - b.width) < 1e-3 &&
            Math.abs(a.height - b.height) < 1e-3
        );
    }

    public updateAvatarWindow = (userUUID: string, window: UserWindow): void => {
        if (this.isCreator && this.userWindowsStorage && !this.userWindowsGrid) {
            const maxZ = this.maxZOfUserWindows(userUUID);
            const newValue = { ...window, z: maxZ + 1 };
            const oldValue = (this.userWindowsStorage.state as any)[userUUID];
            if (!this.isWindowEqual(oldValue, newValue)) {
                this.userWindowsStorage.setState({ [userUUID]: newValue });
            }
        }
    };

    public deleteAvatarWindow = (userUUID: string): void => {
        // joiners can delete themselves
        if (this.userWindowsStorage?.isWritable) {
            this.userWindowsStorage.setState({ [userUUID]: undefined });
            let grid = this.userWindowsStorage.state.grid;
            if (grid && grid.includes(userUUID)) {
                grid = grid.filter(uuid => uuid !== userUUID);
                if (grid.length === 0) {
                    grid = null;
                }
                this.userWindowsStorage.setState({ grid });
            }
        }
    };

    public setDroppingUserUUID = (userUUID: string | null): void => {
        this.droppingUserUUID = userUUID;
    };

    public isDropTarget = (userUUID: string): boolean => {
        return this.droppingUserUUID === userUUID;
    };

    public onDrop = (file: File): void => {
        this.toggleCloudStoragePanel(true);
        const cloudStorage = this.whiteboardStore.cloudStorageStore;
        cloudStorage.setPanelExpand(true);
        cloudStorage.uploadTaskManager.addTasks([file], cloudStorage.parentDirectoryPath);
    };

    public setHoveringUserUUID = (userUUID: string | null): void => {
        this.hoveringUserUUID = userUUID;
    };

    public onMessageSend = async (text: string): Promise<void> => {
        if (this.isBan && !this.isCreator) {
            return;
        }
        if (globalStore.censorshipText && !(await checkRTMCensor({ text })).valid) {
            return;
        }
        await this.rtm.sendRoomMessage(text);
    };

    public toggleRecording = async ({ onStop }: { onStop?: () => void } = {}): Promise<void> => {
        this.isRecordingLoading = true;
        try {
            if (this.isRecording) {
                await this.stopRecording();
                onStop?.();
            } else {
                await this.startRecording();
            }
        } catch (e) {
            errorTips(e as Error);
        }
        runInAction(() => {
            this.isRecordingLoading = false;
        });
    };

    public updateRecordingLayout = (users: Array<{ uid: string; avatar: string }>): void => {
        if (this.isRecording) {
            void this.recording.updateLayout(users);
        }
    };

    public updateClassMode = (classMode?: ClassModeType): void => {
        this.classMode =
            classMode ??
            (this.roomInfo?.roomType === RoomType.SmallClass
                ? ClassModeType.Interaction
                : ClassModeType.Lecture);
    };

    public updateRoomStatus = (roomStatus: RoomStatus): void => {
        if (this.roomInfo && this.roomInfo.roomStatus !== roomStatus) {
            this.roomInfo.roomStatus = roomStatus;
            if (this.isCreator) {
                this.rtm.sendRoomCommand("update-room-status", {
                    roomUUID: this.roomUUID,
                    status: roomStatus,
                });
            }
        }
    };

    public updateShareScreen = (local: boolean, remote: boolean): void => {
        this.isScreenSharing = local;
        this.isRemoteScreenSharing = remote;
    };

    public refreshShareScreenInfo = async (): Promise<void> => {
        this.selectShareScreenInfo(null);
        this.shareScreenInfo = [];
        const shareScreenInfo = await this.rtc.shareScreen.getScreenInfo();
        runInAction(() => {
            this.shareScreenInfo = shareScreenInfo;
        });
    };

    public toggleShareScreenPicker = (force = !this.shareScreenPickerVisible): void => {
        this.shareScreenPickerVisible = force;
    };

    public selectShareScreenInfo = (info: IServiceShareScreenInfo | null): void => {
        this.selectedScreenInfo = info;
        this.rtc.shareScreen.setScreenInfo(info);
    };

    public toggleShareScreenWithAudio = (force = !this.shareScreenWithAudio): void => {
        this.shareScreenWithAudio = force;
    };

    public setShareScreenAudioDevice = (deviceName: string): void => {
        this.shareScreenAudioDeviceName = deviceName;
    };

    public toggleShareScreen = (force = !this.isScreenSharing): void => {
        // Guide the current user to turn on microphone on screen sharing with audio.
        if (
            force &&
            this.shareScreenWithAudio &&
            this.shareScreenPickerVisible &&
            this.users.currentUser &&
            this.users.currentUser.mic === false
        ) {
            message.info(FlatI18n.t("share-screen.please-turn-on-mic"));
        }
        const deviceName = this.shareScreenWithAudio ? this.shareScreenAudioDeviceName : undefined;
        this.rtc.shareScreen.enable(force, deviceName);
        this.toggleShareScreenPicker(false);
    };

    public acceptRaiseHand = (userUUID: string): void => {
        if (this.isCreator && this.classroomStorage?.isWritable) {
            if (this.classroomStorage.state.raiseHandUsers.includes(userUUID)) {
                this.onStaging(userUUID, true);
            }
        }
    };

    public onCancelAllHandRaising = (): void => {
        if (this.isCreator && this.classroomStorage?.isWritable) {
            this.classroomStorage.setState({ raiseHandUsers: [] });
        }
    };

    /** When current user (who is a joiner) raises hand */
    public onToggleHandRaising = (raise?: boolean): void => {
        if (this.isCreator || this.users.currentUser?.isSpeak) {
            return;
        }

        if (this.users.currentUser) {
            raise ??= !this.users.currentUser.isRaiseHand;

            void this.rtm.sendPeerCommand(
                "raise-hand",
                { roomUUID: this.roomUUID, raiseHand: raise },
                this.ownerUUID,
            );

            if (raise) {
                message.info(FlatI18n.t("have-raised-hand"));
            }
        }
    };

    public onToggleHandRaisingPanel = (force = !this.isHandRaisingPanelVisible): void => {
        this.isHandRaisingPanelVisible = force;
        // fetch lazy loaded users when the hand raising panel is opened
        if (force) {
            const raiseHandUsers = this.classroomStorage?.state.raiseHandUsers;
            if (raiseHandUsers) {
                this.users.flushLazyUsers(raiseHandUsers).catch(console.error);
            }
        }
    };

    public onToggleBan = (): void => {
        if (this.isCreator && this.classroomStorage?.isWritable) {
            this.classroomStorage.setState({ ban: !this.classroomStorage.state.ban });
        }
    };

    private updateIsBan(ban: boolean): void {
        this.isBan = ban;
    }

    public setAiInfo(aiInfo?: AIInfo): void {
        if (this.classroomStorage && this.classroomStorage.isWritable) {
            this.classroomStorage.setState({ aiInfo });
        }
    }

    public onStaging = (userUUID: string, onStage: boolean): void => {
        if (
            this.classMode === ClassModeType.Interaction ||
            userUUID === this.ownerUUID ||
            !this.onStageUsersStorage?.isWritable
        ) {
            return;
        }
        if (!onStage) {
            this.updateDeviceState(userUUID, false, false);
            this.deleteAvatarWindow(userUUID);
        }
        if (this.isCreator) {
            if (!onStage || this.assertStageNotFull()) {
                this.onStageUsersStorage.setState({ [userUUID]: onStage });
            } else {
                // assert failed
                return;
            }
        } else {
            // joiner can only turn off speaking
            if (!onStage && userUUID === this.userUUID) {
                this.onStageUsersStorage.setState({ [userUUID]: false });
            }
        }
        if (this.classroomStorage?.state.raiseHandUsers.includes(userUUID)) {
            const raiseHandUsers = this.classroomStorage.state.raiseHandUsers;
            this.classroomStorage.setState({
                raiseHandUsers: raiseHandUsers.filter(id => id !== userUUID),
            });
        }
    };

    private assertStageNotFull(showWarning = true): boolean {
        const limit = this.roomType === RoomType.SmallClass ? 16 : 1;
        if (this.onStageUserUUIDs.length < limit) {
            return true;
        }
        const i18nKey =
            "warn-staging-limit." +
            (this.roomType === RoomType.SmallClass ? "small-class" : "other");
        showWarning && message.warn({ content: FlatI18n.t(i18nKey), style: { whiteSpace: "pre" } });
        return false;
    }

    public offStageAll = async (): Promise<void> => {
        if (this.classMode === ClassModeType.Interaction || !this.onStageUsersStorage?.isWritable) {
            return;
        }
        if (this.isCreator) {
            this.onStageUsersStorage.resetState();
            this.whiteboardStorage?.resetState();
            this.userWindowsStorage?.resetState();
            message.info(FlatI18n.t("all-off-stage-toast"));
        }
    };

    public muteAll = async (): Promise<void> => {
        if (this.isCreator && this.deviceStateStorage && this.deviceStateStorage.isWritable) {
            const state = this.deviceStateStorage.state;
            const payload: Partial<DeviceStateStorageState> = {};
            for (const userUUID in state) {
                if (userUUID !== this.userUUID && state[userUUID].mic) {
                    payload[userUUID] = { ...state[userUUID], mic: false };
                }
            }
            this.deviceStateStorage.setState(payload);
            message.info(FlatI18n.t("all-mute-mic-toast"));
        }
    };

    public authorizeWhiteboard = async (userUUID: string, enabled: boolean): Promise<void> => {
        if (
            this.classMode === ClassModeType.Interaction ||
            userUUID === this.ownerUUID ||
            !this.whiteboardStorage?.isWritable
        ) {
            return;
        }
        if (this.isCreator) {
            this.whiteboardStorage.setState({ [userUUID]: enabled });
        } else {
            // joiner can only turn off drawing
            if (!enabled && userUUID === this.userUUID) {
                this.whiteboardStorage.setState({ [userUUID]: false });
            }
        }
    };

    /** joiner updates own camera and mic state */
    public updateDeviceState = (userUUID: string, camera: boolean, mic: boolean): void => {
        if (this.deviceStateStorage?.isWritable && (this.userUUID === userUUID || this.isCreator)) {
            const deviceState = this.deviceStateStorage.state[userUUID] || {
                camera: false,
                mic: false,
            };
            let shouldNotify = false;
            // creator can request joiner to turn on camera and mic
            if (this.isCreator && userUUID !== this.userUUID) {
                if (camera && !deviceState.camera) {
                    void this.rtm.sendPeerCommand(
                        "request-device",
                        { roomUUID: this.roomUUID, camera },
                        userUUID,
                    );
                    message.info(FlatI18n.t("sent-invitation"));
                    return;
                }
                if (mic && !deviceState.mic) {
                    void this.rtm.sendPeerCommand(
                        "request-device",
                        { roomUUID: this.roomUUID, mic },
                        userUUID,
                    );
                    message.info(FlatI18n.t("sent-invitation"));
                    return;
                }
                shouldNotify = true;
            }
            // creator can turn off joiner's camera and mic
            this.deviceStateStorage.setState({
                [userUUID]: camera || mic ? { camera, mic } : undefined,
            });
            if (shouldNotify) {
                if (!camera && deviceState.camera) {
                    message.info(FlatI18n.t("has-turn-off-camera"));
                    void this.rtm.sendPeerCommand(
                        "notify-device-off",
                        { roomUUID: this.roomUUID, camera },
                        userUUID,
                    );
                }
                if (!mic && deviceState.mic) {
                    message.info(FlatI18n.t("has-turn-off-mic"));
                    void this.rtm.sendPeerCommand(
                        "notify-device-off",
                        { roomUUID: this.roomUUID, mic },
                        userUUID,
                    );
                }
            }
        }
    };

    public toggleRequestingDevice(camera: boolean | undefined, mic: boolean | undefined): void {
        if (camera !== undefined) {
            this.isRequestingCamera = camera;
        }
        if (mic !== undefined) {
            this.isRequestingMic = mic;
        }
    }

    public replyRequestingDevice(device: "camera" | "mic", enabled: boolean): void {
        if (!this.isCreator) {
            void this.rtm.sendPeerCommand(
                "request-device-response",
                { roomUUID: this.roomUUID, [device]: enabled },
                this.ownerUUID,
            );
        }
    }

    public reward(userUUID: string): boolean {
        if (this.isCreator) {
            const lastReward = this.rewardCooldown.get(userUUID) || 0;
            // 3s cooldown before rewarding the same user
            if (Date.now() - lastReward < 3000) {
                return false;
            }
            this.rewardCooldown.set(userUUID, Date.now());
            void this.rtm.sendRoomCommand("reward", { roomUUID: this.roomUUID, userUUID });
            return true;
        }
        return false;
    }

    public isAvatarsVisible(): boolean {
        return globalStore.isAvatarsVisible(this.roomUUID);
    }

    public toggleAvatars = (): void => {
        globalStore.toggleAvatars(this.roomUUID, !this.isAvatarsVisible());
    };

    private async switchRoomStatus(roomStatus: RoomStatus): Promise<void> {
        if (!this.isCreator || this.roomStatusLoading !== RoomStatusLoadingType.Null) {
            return;
        }

        if (!this.roomInfo) {
            throw new Error("Room not ready!");
        }

        try {
            switch (roomStatus) {
                case RoomStatus.Started: {
                    this.updateRoomStatusLoading(RoomStatusLoadingType.Starting);
                    await startClass(this.roomUUID);
                    await roomStore.syncOrdinaryRoomInfo(this.roomUUID);
                    const roomUUID = this.roomUUID;
                    const periodicUUID = globalStore.periodicUUID;
                    if (periodicUUID) {
                        await roomStore.syncPeriodicSubRoomInfo({ periodicUUID, roomUUID });
                    }
                    break;
                }
                case RoomStatus.Paused: {
                    this.updateRoomStatusLoading(RoomStatusLoadingType.Pausing);
                    await pauseClass(this.roomUUID);
                    break;
                }
                case RoomStatus.Stopped: {
                    this.updateRoomStatusLoading(RoomStatusLoadingType.Stopping);
                    if (this.isAIRoom && this.aiChatStore) {
                        await this.aiChatStore.stop();
                    }
                    await stopClass(this.roomUUID);
                    globalStore.updatePmiRoomListByRoomUUID(this.roomUUID);
                    break;
                }
                default: {
                    break;
                }
            }

            // update room status finally
            // so that the component won't unmount before sending commands
            this.updateRoomStatus(roomStatus);
        } catch (e) {
            errorTips(e as Error);
            console.error(e);
        }
        this.updateRoomStatusLoading(RoomStatusLoadingType.Null);
    }

    private updateRoomStatusLoading = (loading: RoomStatusLoadingType): void => {
        this.roomStatusLoading = loading;
    };

    private async startRecording(): Promise<void> {
        await this.recording.startRecording();
    }

    private async stopRecording(): Promise<void> {
        this.recordingEndSentinel = true;
        await this.recording.stopRecording();
        this.recordingEndSentinel = false;
    }

    private async initRTC(): Promise<void> {
        this.sideEffect.addDisposer(
            this.rtc.events.on(
                "network",
                action("checkNetworkQuality", networkQuality => {
                    this.networkQuality = networkQuality;
                }),
            ),
        );

        this.sideEffect.addDisposer(
            this.rtc.shareScreen.events.on(
                "local-changed",
                action("localShareScreen", enabled => {
                    this.isScreenSharing = enabled;
                }),
            ),
        );

        this.sideEffect.addDisposer(
            this.rtc.shareScreen.events.on(
                "remote-changed",
                action("remoteShareScreen", enabled => {
                    this.isRemoteScreenSharing = enabled;
                }),
            ),
        );

        if (globalStore.rtcUID) {
            await this.rtc.joinRoom({
                roomUUID: this.roomUUID,
                uid: String(globalStore.rtcUID),
                token: globalStore.rtcToken,
                mode: IServiceVideoChatMode.Broadcast,
                role:
                    this.isCreator ||
                    (globalStore.userUUID && this.onStageUsersStorage?.state[globalStore.userUUID])
                        ? IServiceVideoChatRole.Host
                        : IServiceVideoChatRole.Audience,
                refreshToken: generateRTCToken,
                shareScreenUID: String(globalStore.rtcShareScreen?.uid || -1),
                shareScreenToken: globalStore.rtcShareScreen?.token || "",
                mirror: preferencesStore.mirrorMode,
            });

            if (preferencesStore.cameraId) {
                await this.rtc.setCameraID(preferencesStore.cameraId);
            }

            if (preferencesStore.microphoneId) {
                await this.rtc.setMicID(preferencesStore.microphoneId);
            }

            if (preferencesStore.speakerId) {
                await this.rtc.setSpeakerID(preferencesStore.speakerId);
            }

            runInAction(() => {
                this.isJoinedRTC = true;
            });
        }
    }

    public hideAdminMessage = (): void => {
        this.adminMessage = "";
    };

    private handleAdminMessage(text: string): void {
        if (text && text[0] === "{") {
            try {
                const data = JSON.parse(text);
                if (data && typeof data === "object") {
                    const msg = data as {
                        roomLevel: 0 | 1;
                        expireAt: number;
                        leftMinutes: number;
                        message: string;
                    };
                    // TODO: roomType = derive from msg.roomLevel
                    const roomType = FlatI18n.getInstance().language === "zh-CN" ? "" : "its";
                    const expireAt = format(new Date(msg.expireAt), "HH:mm");
                    const minutes = msg.leftMinutes;
                    const info = FlatI18n.t("the-room-is-about-to-end", {
                        roomType,
                        expireAt,
                        minutes,
                    });
                    this.expireAt = msg.expireAt;
                    this.adminMessage = info;
                    return;
                }
            } catch (error) {
                console.warn(error);
                // fallback to normal message
            }
        }

        this.adminMessage = text;
    }

    private async handleUserJoinedChunk(user: Pick<IAgoraRTCRemoteUser, "uid">): Promise<void> {
        const { uid } = user;
        const uidStr = uid.toString();
        if (uid !== globalStore.rtcUID) {
            const aiInfo = this.classroomStorage?.state.aiInfo || globalStore.aiInfo;
            if (!aiInfo) {
                return;
            }
            aiInfo.rtcUID = uidStr;
            this.setAiInfo(aiInfo);
            if (!this.isAIExisted) {
                this.createMaximizedAvatarWindow(this.ownerUUID);
                this.createMaximizedAvatarWindow(uidStr);
            }
            this.isHasAIUser = true;
            this.rtc.setAiUserUUId(uidStr);
        }
    }
}
