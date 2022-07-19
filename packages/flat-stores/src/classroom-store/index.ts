import { SideEffectManager } from "side-effect-manager";
import { action, makeAutoObservable, observable, reaction, runInAction } from "mobx";
import { RoomState as WhiteRoomState, RoomMember as WhiteRoomMember } from "white-web-sdk";
import { FlatRTC, FlatRTCMode, FlatRTCRole } from "@netless/flat-rtc";
import type { FlatRTM } from "@netless/flat-rtm";
import {
    pauseClass,
    startClass,
    stopClass,
    generateRTCToken,
    RoomStatus,
    RoomType,
    checkRTMCensor,
} from "@netless/flat-server-api";
import { i18n } from "flat-i18n";
import { errorTips, message } from "flat-components";
import { Storage } from "@netless/fastboard-core";
import { RoomItem, roomStore } from "../room-store";
import { UserStore } from "../user-store";
import { WhiteboardStore } from "../whiteboard-store";
import { globalStore } from "../global-store";
import { ClassModeType, RoomStatusLoadingType } from "./constants";
import { ChatStore } from "./chat-store";

export * from "./constants";
export * from "./chat-store";

export interface ClassroomStoreConfig {
    roomUUID: string;
    ownerUUID: string;
    rtc: FlatRTC;
    rtm: FlatRTM;
}

export type DeviceStateStorageState = Record<string, { camera: boolean; mic: boolean }>;
export type ClassroomStorageState = {
    classMode?: ClassModeType;
    raiseHandUsers: string[];
};

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

    public readonly users: UserStore;

    public readonly rtc: FlatRTC;
    public readonly rtm: FlatRTM;
    public readonly chatStore: ChatStore;
    public readonly whiteboardStore: WhiteboardStore;

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
        });

        this.whiteboardStore = new WhiteboardStore({
            isCreator: this.isCreator,
            isWritable: this.isCreator,
            getRoomType: () => this.roomInfo?.roomType || RoomType.BigClass,
            i18n: i18n,
            onDrop: this.onDrop,
        });

        makeAutoObservable<this, "sideEffect">(this, {
            rtc: observable.ref,
            rtm: observable.ref,
            sideEffect: false,
            deviceStateStorage: observable.ref,
            classroomStorage: observable.ref,
        });

        this.sideEffect.addDisposer(
            reaction(
                () => this.isRecording,
                (isRecording: boolean) => {
                    if (isRecording) {
                        void message.success(i18n.t("start-recording"));
                    }
                },
            ),
        );

        if (!this.isCreator) {
            this.sideEffect.addDisposer(
                reaction(
                    () => this.classMode === ClassModeType.Interaction,
                    (isInteraction: boolean) => {
                        this.whiteboardStore.updateWritable(isInteraction);
                    },
                ),
            );
        }

        this.sideEffect.addDisposer(
            this.rtm.events.on(
                "remote-login",
                action("remote-login", () => {
                    this.isRemoteLogin = true;
                }),
            ),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on(
                "ban",
                action("ban", event => {
                    if (event.senderID === this.ownerUUID) {
                        this.isBan = event.status;
                    }
                }),
            ),
        );

        if (this.isCreator) {
            this.sideEffect.addDisposer(
                this.rtm.events.on("raise-hand", message => {
                    if (
                        this.classroomStorage?.isWritable &&
                        this.roomUUID === message.roomUUID &&
                        this.classroomStorage.state.raiseHandUsers.every(
                            userUUID => userUUID !== message.userUUID,
                        )
                    ) {
                        this.classroomStorage.setState({
                            raiseHandUsers: [
                                ...this.classroomStorage.state.raiseHandUsers,
                                message.userUUID,
                            ],
                        });
                    }
                }),
            );
        } else {
            this.sideEffect.addDisposer(
                this.rtm.events.on("on-stage", message => {
                    if (this.roomUUID === message.roomUUID && this.ownerUUID === message.senderID) {
                        this.whiteboardStore.updateWritable(message.onStage);
                    }
                }),
            );
        }
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

        const onStageUsers = new Set<string>();
        const updateOnStateUsers = (roomMembers: ReadonlyArray<WhiteRoomMember>): void => {
            // @TODO handle on-staged users separately outside of the UserStore
            onStageUsers.clear();
            roomMembers.forEach(member => {
                const uid = member.payload?.uid;
                if (uid) {
                    onStageUsers.add(uid);
                }
            });
        };
        updateOnStateUsers(fastboard.room.state.roomMembers);

        const deviceStateStorage = fastboard.syncedStore.connectStorage<DeviceStateStorageState>(
            "deviceState",
            {},
        );
        const classroomStorage = fastboard.syncedStore.connectStorage<ClassroomStorageState>(
            "raiseHand",
            {
                classMode: ClassModeType.Lecture,
                raiseHandUsers: [],
            },
        );
        this.deviceStateStorage = deviceStateStorage;
        this.classroomStorage = classroomStorage;

        this.updateClassMode(classroomStorage.state.classMode);

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
            if (onStageUsers.has(user.userUUID)) {
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
        this.updateDeviceState(
            this.userUUID,
            Boolean(this.users.currentUser?.camera),
            Boolean(this.users.currentUser?.mic),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on("member-joined", ({ userUUID }) => {
                console.log("member-joined", userUUID);
                this.users.addUser(userUUID);
                if (onStageUsers.has(userUUID)) {
                    this.users.updateUsers(user => {
                        if (userUUID === user.userUUID) {
                            user.isSpeak = true;
                            user.isRaiseHand = false;
                            const deviceState = deviceStateStorage.state[user.userUUID];
                            if (deviceState) {
                                user.camera = deviceState.camera;
                                user.mic = deviceState.mic;
                            }
                            return false;
                        }
                        return true;
                    });
                }
            }),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on("member-left", ({ userUUID }) => {
                this.users.removeUser(userUUID);
            }),
        );

        this.sideEffect.addDisposer(
            classroomStorage.on("stateChanged", diff => {
                if (diff.classMode) {
                    this.updateClassMode(diff.classMode.newValue);
                }
                if (diff.raiseHandUsers) {
                    updateRaiseHandUsers(diff.raiseHandUsers.newValue);
                    this.users.updateUsers(user => {
                        user.isRaiseHand = raiseHandUsers.has(user.userUUID);
                    });
                }
            }),
        );

        this.sideEffect.add(() => {
            const handler = (state: Partial<WhiteRoomState>): void => {
                if (state.roomMembers) {
                    updateOnStateUsers(state.roomMembers);
                    this.users.updateUsers(user => {
                        if (onStageUsers.has(user.userUUID)) {
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
                        }
                    });
                }
            };
            fastboard.room.callbacks.on("onRoomStateChanged", handler);
            return () => fastboard.room.callbacks.off("onRoomStateChanged", handler);
        });

        this.sideEffect.addDisposer(
            deviceStateStorage.on("stateChanged", diff => {
                this.users.updateUsers(user => {
                    const deviceState = diff[user.userUUID]?.newValue;
                    user.camera = Boolean(deviceState?.camera);
                    user.mic = Boolean(deviceState?.mic);
                });
            }),
        );
    }

    public async destroy(): Promise<void> {
        this.sideEffect.flushAll();

        const promises: Array<Promise<any>> = [];

        promises.push(this.rtm.destroy());

        // promises.push(this.stopRecording());

        promises.push(this.rtc.destroy());

        promises.push(this.rtc.destroy());

        promises.push(this.whiteboardStore.destroy());

        try {
            await Promise.all(promises);
        } catch (e) {
            console.error(e);
        }

        this.deviceStateStorage = undefined;
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
    };

    public toggleClassMode = (): void => {
        if (this.classroomStorage?.isWritable) {
            this.classroomStorage.setState({
                classMode:
                    this.classMode === ClassModeType.Lecture
                        ? ClassModeType.Interaction
                        : ClassModeType.Lecture,
            });
        }
    };

    public updateClassMode = (classMode?: ClassModeType): void => {
        this.classMode =
            classMode ??
            (this.roomInfo?.roomType === RoomType.SmallClass
                ? ClassModeType.Interaction
                : ClassModeType.Lecture);
    };

    public updateRoomStatus = (roomStatus?: RoomStatus): void => {
        if (this.roomInfo) {
            this.roomInfo.roomStatus = roomStatus;
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
                this.rtm.sendPeerCommand(
                    "on-stage",
                    { roomUUID: this.roomUUID, onStage: true },
                    userUUID,
                );
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

    public onToggleBan = async (): Promise<void> => {
        if (!this.isCreator) {
            return;
        }
        const newBanStatus = !this.isBan;
        await this.rtm.sendRoomCommand("ban", {
            roomUUID: this.roomUUID,
            status: newBanStatus,
        });
    };

    public onStaging = async (userUUID: string, onStage: boolean): Promise<void> => {
        if (this.classMode === ClassModeType.Interaction || userUUID === this.ownerUUID) {
            return;
        }
        if (this.isCreator) {
            this.rtm.sendPeerCommand("on-stage", { roomUUID: this.roomUUID, onStage }, userUUID);
        } else {
            // joiner can only turn off speaking
            if (!onStage && userUUID === this.userUUID) {
                this.whiteboardStore.updateWritable(onStage);
            }
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
            this.deviceStateStorage.setState({ [userUUID]: { camera, mic } });
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
        // @TODO add cloud recording
    }

    private async stopRecording(): Promise<void> {
        // @TODO add cloud recording
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
                uid: globalStore.rtcUID,
                token: globalStore.rtcToken,
                mode:
                    this.roomInfo?.roomType === RoomType.BigClass
                        ? FlatRTCMode.Broadcast
                        : FlatRTCMode.Communication,
                role: this.isCreator ? FlatRTCRole.Host : FlatRTCRole.Audience,
                refreshToken: generateRTCToken,
                shareScreenUID: globalStore.rtcShareScreen?.uid || -1,
                shareScreenToken: globalStore.rtcShareScreen?.token || "",
            });

            runInAction(() => {
                this.isJoinedRTC = true;
            });
        }
    }
}
