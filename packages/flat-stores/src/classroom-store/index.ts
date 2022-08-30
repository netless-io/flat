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
import { globalStore } from "../global-store";
import { ClassModeType, RoomStatusLoadingType } from "./constants";
import { ChatStore } from "./chat-store";
import {
    IServiceRecording,
    IServiceTextChat,
    IServiceVideoChat,
    IServiceVideoChatMode,
    IServiceVideoChatRole,
    IServiceWhiteboard,
} from "@netless/flat-services";
import { preferencesStore } from "../preferences-store";

export * from "./constants";
export * from "./chat-store";

export interface ClassroomStoreConfig {
    roomUUID: string;
    ownerUUID: string;
    rtc: IServiceVideoChat;
    rtm: IServiceTextChat;
    whiteboard: IServiceWhiteboard;
    recording: IServiceRecording;
}

export type DeviceStateStorageState = Record<string, { camera: boolean; mic: boolean }>;
export type ClassroomStorageState = {
    ban: boolean;
    raiseHandUsers: string[];
};
export type OnStageUsersStorageState = Record<string, boolean>;

export class ClassroomStore {
    private readonly sideEffect = new SideEffectManager();

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

    public isCloudStoragePanelVisible = false;

    public roomStatusLoading = RoomStatusLoadingType.Null;

    /** is RTC joined room */
    public isJoinedRTC = false;

    /** is current user sharing screen */
    public isScreenSharing = false;
    /** is other users sharing screen */
    public isRemoteScreenSharing = false;

    public networkQuality = {
        delay: 0,
        uplink: 0,
        downlink: 0,
    };

    public deviceStateStorage?: Storage<DeviceStateStorageState>;
    public classroomStorage?: Storage<ClassroomStorageState>;
    public onStageUsersStorage?: Storage<OnStageUsersStorageState>;

    public readonly users: UserStore;

    public readonly onStageUserUUIDs = observable.array<string>();

    public readonly rtc: IServiceVideoChat;
    public readonly rtm: IServiceTextChat;
    public readonly chatStore: ChatStore;
    public readonly whiteboardStore: WhiteboardStore;
    public readonly recording: IServiceRecording;

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
            isInRoom: userUUID => this.rtm.members.has(userUUID),
        });

        this.whiteboardStore = new WhiteboardStore({
            isCreator: this.isCreator,
            isWritable: this.isCreator,
            getRoomType: () => this.roomInfo?.roomType || RoomType.BigClass,
            whiteboard: config.whiteboard,
            onDrop: this.onDrop,
        });

        makeAutoObservable<this, "sideEffect">(this, {
            rtc: observable.ref,
            rtm: observable.ref,
            sideEffect: false,
            deviceStateStorage: false,
            classroomStorage: false,
            onStageUsersStorage: false,
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

        if (!this.isCreator) {
            this.rtm.events.on("update-room-status", event => {
                if (event.roomUUID === this.roomUUID && event.senderID === this.ownerUUID) {
                    this.updateRoomStatus(event.status);
                }
            });
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

    public async init(): Promise<void> {
        await roomStore.syncOrdinaryRoomInfo(this.roomUUID);

        if (process.env.Node_ENV === "development") {
            if (this.roomInfo && this.roomInfo.ownerUUID !== this.ownerUUID) {
                (this.ownerUUID as string) = this.roomInfo.ownerUUID;
                if (process.env.DEV) {
                    console.error(new Error("ClassRoom Error: ownerUUID mismatch!"));
                }
            }
        }

        await this.initRTC();

        await this.rtm.joinRoom({
            roomUUID: this.roomUUID,
            ownerUUID: this.ownerUUID,
            uid: this.userUUID,
            token: globalStore.rtmToken,
            refreshToken: generateRTCToken,
        });

        const fastboard = await this.whiteboardStore.joinWhiteboardRoom();

        await this.users.initUsers([...this.rtm.members]);

        const deviceStateStorage = fastboard.syncedStore.connectStorage<DeviceStateStorageState>(
            "deviceState",
            {},
        );
        const classroomStorage = fastboard.syncedStore.connectStorage<ClassroomStorageState>(
            "classroom",
            {
                ban: false,
                raiseHandUsers: [],
            },
        );
        const onStageUsersStorage = fastboard.syncedStore.connectStorage<OnStageUsersStorageState>(
            "onStageUsers",
            {},
        );
        this.deviceStateStorage = deviceStateStorage;
        this.classroomStorage = classroomStorage;
        this.onStageUsersStorage = onStageUsersStorage;

        if (this.isCreator) {
            this.updateDeviceState(
                this.userUUID,
                Boolean(preferencesStore.autoCameraOn),
                Boolean(preferencesStore.autoMicOn),
            );
        } else {
            this.whiteboardStore.updateWritable(Boolean(onStageUsersStorage.state[this.userUUID]));
        }

        this._updateIsBan(classroomStorage.state.ban);

        this.chatStore.onNewMessage = message => {
            if (this.isRecording) {
                fastboard.syncedStore.dispatchEvent("new-message", message);
            }
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
        });

        this.sideEffect.addDisposer(
            this.rtm.events.on("member-joined", async ({ userUUID }) => {
                await this.users.addUser(userUUID);
                this.users.updateUsers(user => {
                    if (user.userUUID === userUUID) {
                        if (userUUID === this.ownerUUID || onStageUsersStorage.state[userUUID]) {
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
                            return false;
                        }
                    }
                    return true;
                });
            }),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on("member-left", ({ userUUID }) => {
                this.users.removeUser(userUUID);
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
                    this._updateIsBan(diff.ban.newValue);
                    if (this.isCreator) {
                        this.rtm.sendRoomCommand("ban", {
                            roomUUID: this.roomUUID,
                            status: diff.ban.newValue,
                        });
                    }
                }
            }),
        );

        const updateUserStagingState = async (): Promise<void> => {
            const onStageUsers = Object.keys(onStageUsersStorage.state).filter(
                userUUID => onStageUsersStorage.state[userUUID],
            );
            await this.users.syncExtraUsersInfo(onStageUsers);
            this.onStageUserUUIDs.replace(onStageUsers);
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
                this.whiteboardStore.updateWritable(
                    Boolean(onStageUsersStorage.state[this.userUUID]),
                );
            }
        };
        updateUserStagingState();

        this.sideEffect.addDisposer(onStageUsersStorage.on("stateChanged", updateUserStagingState));

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
            }),
        );

        if (this.roomType === RoomType.OneToOne) {
            if (this.isCreator && this.roomStatus === RoomStatus.Idle) {
                void this.startClass();
            }

            if (this.isCreator && fastboard.syncedStore.isRoomWritable) {
                await fastboard.syncedStore.nextFrame();
                this.sideEffect.addDisposer(
                    autorun(reaction => {
                        if (this.onStageUserUUIDs.length > 0) {
                            reaction.dispose();
                            return;
                        }
                        if (this.users.joiners.length === 1) {
                            this.onStaging(this.users.joiners[0].userUUID, true);
                        }
                    }),
                );
            }
        }

        if (this.isCreator) {
            await this.recording.joinRoom({
                roomID: this.roomUUID,
                classroomType: this.roomType,
            });
        }
    }

    public async destroy(): Promise<void> {
        this.sideEffect.flushAll();

        // promises.push(this.stopRecording());

        this.deviceStateStorage = undefined;
        this.onStageUsersStorage = undefined;
        this.classroomStorage = undefined;
    }

    public startClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Started);

    public pauseClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Paused);

    public stopClass = (): Promise<void> => this.switchRoomStatus(RoomStatus.Stopped);

    public hangClass = async (): Promise<void> => {
        // delay resolve for better UX
        await new Promise(resolve => setTimeout(resolve, 200));
    };

    public toggleCloudStoragePanel = (visible: boolean): void => {
        this.isCloudStoragePanelVisible = visible;
    };

    public onDrop = (file: File): void => {
        this.toggleCloudStoragePanel(true);
        const cloudStorage = this.whiteboardStore.cloudStorageStore;
        cloudStorage.setPanelExpand(true);
        cloudStorage.uploadTaskManager.addTasks([file]);
    };

    public onMessageSend = async (text: string): Promise<void> => {
        if (this.isBan && !this.isCreator) {
            return;
        }
        if (process.env.FLAT_REGION === "CN" && !(await checkRTMCensor({ text })).valid) {
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

    public toggleShareScreen = (force = !this.isScreenSharing): void => {
        this.rtc.shareScreen.enable(force);
    };

    public acceptRaiseHand = (userUUID: string): void => {
        if (this.isCreator && this.classroomStorage?.isWritable) {
            if (this.classroomStorage.state.raiseHandUsers.includes(userUUID)) {
                this.classroomStorage.setState({
                    raiseHandUsers: this.classroomStorage.state.raiseHandUsers.filter(
                        id => id !== userUUID,
                    ),
                });
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
    public onToggleHandRaising = (): void => {
        if (this.isCreator || this.users.currentUser?.isSpeak) {
            return;
        }

        if (this.users.currentUser) {
            void this.rtm.sendPeerCommand(
                "raise-hand",
                { roomUUID: this.roomUUID, raiseHand: !this.users.currentUser.isRaiseHand },
                this.ownerUUID,
            );
        }
    };

    public onToggleBan = (): void => {
        if (this.isCreator && this.classroomStorage?.isWritable) {
            this.classroomStorage.setState({ ban: !this.classroomStorage.state.ban });
        }
    };

    private _updateIsBan(ban: boolean): void {
        this.isBan = ban;
    }

    public onStaging = async (userUUID: string, onStage: boolean): Promise<void> => {
        if (
            this.classMode === ClassModeType.Interaction ||
            userUUID === this.ownerUUID ||
            !this.onStageUsersStorage?.isWritable
        ) {
            return;
        }
        if (this.isCreator) {
            this.onStageUsersStorage.setState({ [userUUID]: onStage });
        } else {
            // joiner can only turn off speaking
            if (!onStage && userUUID === this.userUUID) {
                this.onStageUsersStorage.setState({ [userUUID]: false });
            }
        }
        if (!this.isCreator && !onStage) {
            this.updateDeviceState(userUUID, false, false);
        }
    };

    /** joiner updates own camera and mic state */
    public updateDeviceState = (userUUID: string, camera: boolean, mic: boolean): void => {
        if (this.deviceStateStorage?.isWritable && (this.userUUID === userUUID || this.isCreator)) {
            const deviceState = this.deviceStateStorage.state[userUUID];
            if (deviceState) {
                // creator can turn off joiner's camera and mic
                // creator can request joiner to turn on camera and mic
                if (userUUID !== this.userUUID) {
                    if (camera && !deviceState.camera) {
                        camera = deviceState.camera;
                    }

                    if (mic && !deviceState.mic) {
                        mic = deviceState.mic;
                    }
                }
                if (camera === deviceState.camera && mic === deviceState.mic) {
                    return;
                }
            }
            this.deviceStateStorage.setState({
                [userUUID]: camera || mic ? { camera, mic } : undefined,
            });
        }
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
                    await stopClass(this.roomUUID);
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
        await this.recording.stopRecording();
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
                mode:
                    this.roomInfo?.roomType === RoomType.BigClass
                        ? IServiceVideoChatMode.Broadcast
                        : IServiceVideoChatMode.Communication,
                role:
                    this.isCreator ||
                    (globalStore.userUUID && this.onStageUsersStorage?.state[globalStore.userUUID])
                        ? IServiceVideoChatRole.Host
                        : IServiceVideoChatRole.Audience,
                refreshToken: generateRTCToken,
                shareScreenUID: String(globalStore.rtcShareScreen?.uid || -1),
                shareScreenToken: globalStore.rtcShareScreen?.token || "",
            });

            runInAction(() => {
                this.isJoinedRTC = true;
            });
        }
    }
}
