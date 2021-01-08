import React from "react";
import { RouteComponentProps } from "react-router";
import { v4 as uuidv4 } from "uuid";
import dateSub from "date-fns/sub";
import {
    ClassModeType,
    ClassStatusType,
    NonDefaultUserProp,
    Rtm as RTMAPI,
    RTMessage,
    RTMessageType,
    RTMEvents,
} from "../apiMiddleware/Rtm";
import {
    ordinaryRoomInfo,
    OrdinaryRoomInfo,
    startClass,
    stopClass,
    usersInfo,
} from "../apiMiddleware/flatServer";
import { Identity } from "../utils/localStorage/room";
import { ChatMessageItem } from "./ChatPanel/ChatMessage";
import { RTMUser } from "./ChatPanel/ChatUser";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";

export interface RtmRenderProps extends RtmState {
    rtm: RTMAPI;
    updateHistory: () => Promise<void>;
    acceptRaisehand: (userUUID: string) => void;
    onMessageSend: (text: string) => Promise<void>;
    onCancelAllHandRaising: () => void;
    onToggleHandRaising: () => void;
    onToggleBan: () => void;
    onSpeak: (configs: Array<{ userUUID: string; speak: boolean }>) => void;
    updateDeviceState: (userUUID: string, camera: boolean, mic: boolean) => void;
    toggleClassMode: () => void;
    startClass: () => void;
    pauseClass: () => void;
    resumeClass: () => void;
    stopClass: () => void;
}

export interface RtmProps {
    children: (props: RtmRenderProps) => React.ReactNode;
    roomId: string;
    userId: string;
    identity: Identity;
}

export type RtmState = {
    messages: ChatMessageItem[];
    speakingJoiners: RTMUser[];
    handRaisingJoiners: RTMUser[];
    joiners: RTMUser[];
    isBan: boolean;
    classMode: ClassModeType;
    classStatus: ClassStatusType;
    roomInfo?: OrdinaryRoomInfo;
    creator?: RTMUser;
    currentUser?: RTMUser;
};

export class Rtm extends React.Component<RtmProps, RtmState> {
    private rtm = new RTMAPI();
    private noMoreRemoteMessages = false;
    private cancelHandleChannelStatusTimeout?: number;

    constructor(props: RtmProps) {
        super(props);

        this.state = {
            messages: [],
            speakingJoiners: [],
            handRaisingJoiners: [],
            joiners: [],
            isBan: false,
            classMode: ClassModeType.Lecture,
            classStatus: ClassStatusType.Idle,
        };
    }

    async componentDidMount() {
        const { userId, roomId } = this.props;
        const channel = await this.rtm.init(userId, roomId);
        this.startListenChannel();

        const { roomInfo } = await ordinaryRoomInfo(roomId);
        document.title = roomInfo.title;
        this.setState({ roomInfo, classStatus: this.mapRoomStatus(roomInfo.roomStatus) });

        this.updateHistory();

        const members = await channel.getMembers();
        this.sortUsers(await this.createUsers(members), this.updateInitialRoomState);

        channel.on("MemberJoined", async userUUID => {
            this.sortUsers(await this.createUsers([userUUID]));
        });
        channel.on("MemberLeft", userUUID => {
            this.setState(state => ({
                joiners: state.joiners.filter(user => user.uuid !== userUUID),
            }));
        });
    }

    componentWillUnmount() {
        this.rtm.destroy();
        window.clearTimeout(this.cancelHandleChannelStatusTimeout);
    }

    render(): React.ReactNode {
        return this.props.children({
            ...this.state,
            rtm: this.rtm,
            acceptRaisehand: this.acceptRaisehand,
            updateHistory: this.updateHistory,
            onMessageSend: this.onMessageSend,
            onCancelAllHandRaising: this.onCancelAllHandRaising,
            onToggleHandRaising: this.onToggleHandRaising,
            onToggleBan: this.onToggleBan,
            onSpeak: this.onSpeak,
            updateDeviceState: this.updateDeviceState,
            toggleClassMode: this.toggleClassMode,
            startClass: this.startClass,
            pauseClass: this.pauseClass,
            resumeClass: this.resumeClass,
            stopClass: this.stopClass,
        });
    }

    private mapRoomStatus = (roomStatus: RoomStatus): ClassStatusType => {
        switch (roomStatus) {
            case RoomStatus.Pending: {
                return ClassStatusType.Idle;
            }
            case RoomStatus.Running: {
                return ClassStatusType.Started;
            }
            case RoomStatus.Stopped: {
                return ClassStatusType.Stopped;
            }
            default: {
                return ClassStatusType.Idle;
            }
        }
    };

    private acceptRaisehand = (userUUID: string): void => {
        if (this.props.identity === Identity.creator) {
            this.sortUsers(user =>
                userUUID === user.uuid
                    ? {
                          ...user,
                          isRaiseHand: false,
                          isSpeak: true,
                          camera: false,
                          mic: true,
                      }
                    : user,
            );
            this.rtm.sendCommand({
                type: RTMessageType.AcceptRaiseHand,
                value: { userUUID, accept: true },
                keepHistory: true,
            });
        }
    };

    private onSpeak = (configs: { userUUID: string; speak: boolean }[]): void => {
        const { identity, userId } = this.props;
        if (identity !== Identity.creator) {
            // joiner can only turn off speaking
            configs = configs.filter(config => !config.speak && config.userUUID === userId);
            if (configs.length <= 0) {
                return;
            }
        }
        this.speak(configs);
        this.rtm.sendCommand({
            type: RTMessageType.Speak,
            value: configs,
            keepHistory: true,
        });
    };

    private onMessageSend = async (text: string): Promise<void> => {
        if (this.state.isBan && this.props.identity !== Identity.creator) {
            return;
        }
        await this.rtm.sendMessage(text);
        this.addMessage(RTMessageType.ChannelMessage, text, this.props.userId);
    };

    private onCancelAllHandRaising = (): void => {
        if (this.props.identity === Identity.creator) {
            this.cancelAllHandRaising();
            this.rtm.sendCommand({
                type: RTMessageType.CancelAllHandRaising,
                value: true,
                keepHistory: true,
            });
        }
    };

    /** joiner updates own camera and mic state */
    private updateDeviceState = (userUUID: string, camera: boolean, mic: boolean): void => {
        const { identity, userId } = this.props;
        if (userId === userUUID || identity === Identity.creator) {
            this.sortUsers(
                user => {
                    if (user.uuid === userUUID) {
                        // creator can turn off joiner's camera and mic
                        // creator can request joiner to turn on camera and mic
                        if (userUUID !== userId) {
                            if (camera && !user.camera) {
                                camera = user.camera;
                            }

                            if (mic && !user.mic) {
                                mic = user.mic;
                            }
                        }

                        if (camera !== user.camera || mic !== user.mic) {
                            return { ...user, isRaiseHand: false, camera, mic };
                        }
                    }
                    return user;
                },
                () => {
                    this.rtm.sendCommand({
                        type: RTMessageType.DeviceState,
                        value: { userUUID, camera, mic },
                        keepHistory: true,
                    });
                },
            );
        }
    };

    private onToggleBan = (): void => {
        const { identity, userId } = this.props;
        if (identity !== Identity.creator) {
            return;
        }
        this.setState(
            state => ({
                isBan: !state.isBan,
                messages: [
                    ...state.messages,
                    {
                        type: RTMessageType.BanText,
                        uuid: uuidv4(),
                        timestamp: Date.now(),
                        value: !state.isBan,
                        userId,
                    },
                ],
            }),
            () => {
                this.rtm.sendCommand({
                    type: RTMessageType.BanText,
                    value: this.state.isBan,
                    keepHistory: true,
                });
            },
        );
    };

    // Current user (who is a joiner) raises hand
    private onToggleHandRaising = (): void => {
        const { userId, identity } = this.props;
        const { currentUser } = this.state;
        if (identity !== Identity.joiner || currentUser?.isSpeak) {
            return;
        }
        this.sortUsers(
            user => (user.uuid === userId ? { ...user, isRaiseHand: !user.isRaiseHand } : user),
            () => {
                const { currentUser } = this.state;
                if (currentUser) {
                    this.rtm.sendCommand({
                        type: RTMessageType.RaiseHand,
                        value: currentUser.isRaiseHand,
                        keepHistory: true,
                    });
                }
            },
        );
    };

    /** Add the new message to message list */
    private addMessage = (
        type: RTMessageType.ChannelMessage | RTMessageType.Notice,
        value: string,
        senderId: string,
    ): void => {
        this.setState(state => {
            const timestamp = Date.now();
            const messages = [...state.messages];
            let insertPoint = 0;
            while (insertPoint < messages.length && messages[insertPoint].timestamp <= timestamp) {
                insertPoint++;
            }
            messages.splice(insertPoint, 0, {
                type,
                uuid: uuidv4(),
                timestamp,
                value,
                userId: senderId,
            });
            return { messages };
        });
    };

    private cancelAllHandRaising = (): void => {
        this.sortUsers(user => (user.isRaiseHand ? { ...user, isRaiseHand: false } : user));
    };

    private speak = (configs: Array<{ userUUID: string; speak: boolean }>): void => {
        const configMap = new Map(configs.map(config => [config.userUUID, config]));
        this.sortUsers(user => {
            const config = configMap.get(user.uuid);
            return config
                ? config.speak
                    ? { ...user, isSpeak: true, isRaiseHand: false }
                    : { ...user, isSpeak: false, isRaiseHand: false, camera: false, mic: false }
                : user;
        });
    };

    private startListenChannel = (): void => {
        this.rtm.on(RTMessageType.ChannelMessage, (text, senderId) => {
            this.addMessage(RTMessageType.ChannelMessage, text, senderId);
        });

        this.rtm.on(RTMessageType.CancelAllHandRaising, (_value, senderId) => {
            if (senderId === this.state.creator?.uuid && this.props.identity === Identity.joiner) {
                this.cancelAllHandRaising();
            }
        });

        this.rtm.on(RTMessageType.RaiseHand, (isRaiseHand, senderId) => {
            this.sortUsers(user =>
                user.uuid === senderId && (!isRaiseHand || !user.isSpeak)
                    ? { ...user, isRaiseHand }
                    : user,
            );
        });

        this.rtm.on(RTMessageType.AcceptRaiseHand, ({ userUUID, accept }, senderId) => {
            if (senderId === this.state.creator?.uuid) {
                this.sortUsers(user =>
                    userUUID === user.uuid
                        ? {
                              ...user,
                              isRaiseHand: false,
                              isSpeak: accept,
                              camera: false,
                              mic: accept,
                          }
                        : user,
                );
            }
        });

        this.rtm.on(RTMessageType.BanText, (isBan, senderId) => {
            if (senderId === this.state.creator?.uuid && this.props.identity === Identity.joiner) {
                this.setState(state => ({
                    isBan,
                    messages: [
                        ...state.messages,
                        {
                            type: RTMessageType.BanText,
                            uuid: uuidv4(),
                            timestamp: Date.now(),
                            value: isBan,
                            userId: this.props.userId,
                        },
                    ],
                }));
            }
        });

        this.rtm.on(RTMessageType.DeviceState, ({ userUUID, camera, mic }, senderId) => {
            if (userUUID === senderId) {
                this.sortUsers(user => (user.uuid === userUUID ? { ...user, camera, mic } : user));
            } else if (senderId === this.state.creator?.uuid && (!camera || !mic)) {
                // creator can only turn off other's camera and mic
                this.sortUsers(user =>
                    user.uuid === userUUID
                        ? { ...user, camera: camera && user.camera, mic: mic && user.mic }
                        : user,
                );
            }
        });

        this.rtm.on(RTMessageType.Speak, (configs, senderId) => {
            if (senderId !== this.state.creator?.uuid) {
                // joiner can only turn off speaking
                configs = configs.filter(config => !config.speak && config.userUUID === senderId);
                if (configs.length <= 0) {
                    return;
                }
            }
            this.speak(configs);
        });

        this.rtm.on(RTMessageType.Notice, (text, senderId) => {
            if (senderId === this.state.creator?.uuid) {
                this.addMessage(RTMessageType.Notice, text, senderId);
            }
        });

        this.rtm.on(RTMessageType.ClassMode, (classMode, senderId) => {
            if (senderId === this.state.creator?.uuid) {
                this.setState({ classMode });
            }
        });

        this.rtm.on(RTMessageType.ClassStatus, (classStatus, senderId) => {
            if (senderId === this.state.creator?.uuid) {
                this.setState({ classStatus });
            }
        });

        this.rtm.on(RTMessageType.RequestChannelStatus, (roomUUID, senderId) => {
            if (roomUUID === this.props.roomId) {
                type UStates = RTMEvents[RTMessageType.ChannelStatus]["uStates"];
                const uStates: UStates = {};
                const updateUStates = (user?: RTMUser) => {
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
                        uStates[user.uuid] = result as UStates[keyof UStates];
                    }
                };

                const { creator, speakingJoiners, handRaisingJoiners, joiners } = this.state;
                updateUStates(creator);
                speakingJoiners.forEach(updateUStates);
                handRaisingJoiners.forEach(updateUStates);
                joiners.forEach(updateUStates);

                this.rtm.sendCommand({
                    type: RTMessageType.ChannelStatus,
                    value: {
                        cStatus: this.state.classStatus,
                        uStates,
                    },
                    keepHistory: false,
                    peerId: senderId,
                    retry: 3,
                });
            }
        });
    };

    private updateHistory = async (): Promise<void> => {
        if (this.noMoreRemoteMessages) {
            return;
        }

        let messages: RTMessage[] = [];

        try {
            const oldestTimestap = this.state.messages[0]?.timestamp || Date.now();
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

        this.setState(state => ({ messages: [...textMessages, ...state.messages] }));
    };

    private toggleClassMode = (): void => {
        this.setState(
            state => ({
                classMode:
                    state.classMode === ClassModeType.Lecture
                        ? ClassModeType.Interaction
                        : ClassModeType.Lecture,
            }),
            () => {
                this.rtm.sendCommand({
                    type: RTMessageType.ClassMode,
                    value: this.state.classMode,
                    keepHistory: true,
                });
            },
        );
    };

    private switchClassStatus = (classStatus: ClassStatusType): void => {
        const { identity, roomId } = this.props;
        if (identity !== Identity.creator) {
            return;
        }

        this.setState({ classStatus }, () => {
            this.rtm.sendCommand({
                type: RTMessageType.ClassStatus,
                value: classStatus,
                keepHistory: true,
            });

            if (classStatus === ClassStatusType.Started) {
                startClass(roomId);
            } else if (classStatus === ClassStatusType.Stopped) {
                stopClass(roomId);
            }
        });
    };

    private startClass = (): void => {
        this.switchClassStatus(ClassStatusType.Started);
    };

    private pauseClass = (): void => {
        this.switchClassStatus(ClassStatusType.Paused);
    };

    private resumeClass = (): void => {
        this.switchClassStatus(ClassStatusType.Started);
    };

    private stopClass = (): void => {
        this.switchClassStatus(ClassStatusType.Stopped);
    };

    /**
     * Sort users into different groups.
     * @param mapUser Update a user state. Return the same object if not modified.
     * @param setStateCallback
     */
    private sortUsers(
        mapUser: (user: RTMUser, state: RtmState) => RTMUser,
        setStateCallback?: () => void,
    ): void;
    /**
     * ort users into different groups.
     * @param unSortedUsers A list of unsorted users
     * @param setStateCallback
     */
    private sortUsers(unsortedUsers: RTMUser[], setStateCallback?: () => void): void;
    private sortUsers(
        mapUserOrUnsortedUsers: ((user: RTMUser, state: RtmState) => RTMUser) | RTMUser[],
        setStateCallback?: () => void,
    ): void {
        this.setState(state => {
            const { userId } = this.props;
            const mapUser: ((user: RTMUser, state: RtmState) => RTMUser) | null = Array.isArray(
                mapUserOrUnsortedUsers,
            )
                ? null
                : mapUserOrUnsortedUsers;
            const unSortedUsers: RTMUser[] = mapUser ? [] : (mapUserOrUnsortedUsers as RTMUser[]);

            const newState: Partial<RtmState> = {};

            if (mapUser) {
                if (state.creator) {
                    newState.creator = mapUser(state.creator, state);
                }

                // Pick updated users out of these three groups to an unsorted group
                (["speakingJoiners", "handRaisingJoiners", "joiners"] as const).forEach(key => {
                    for (let i = 0; i < state[key].length; i++) {
                        const user = state[key][i];
                        const mappedUser = mapUser(user, state);
                        // If mapUser returns a new object
                        // that means this is a updated user
                        if (user !== mappedUser) {
                            if (!newState[key]) {
                                // lazy-create new state field
                                // concat items before current updated user
                                newState[key] = state.joiners.slice(0, i);
                            }
                            unSortedUsers.push(mappedUser);
                            continue;
                        }
                        // if new state filed is created
                        // it is going to be committed to next React state
                        // so keep adding the rest of the items
                        newState[key]?.push(user);
                    }
                });
            }

            // sort each unsorted users into different group
            // all groups in new state are lazy-created
            for (const user of unSortedUsers) {
                const isCurrentUser = user.uuid === userId;

                if (isCurrentUser) {
                    newState.currentUser = user;
                }

                if (user.uuid === state.roomInfo?.ownerUUID) {
                    newState.creator = user;
                } else if (user.isSpeak) {
                    if (!newState.speakingJoiners) {
                        newState.speakingJoiners = [...state.speakingJoiners];
                    }
                    newState.speakingJoiners.push(user);
                } else if (user.isRaiseHand) {
                    if (!newState.handRaisingJoiners) {
                        newState.handRaisingJoiners = [...state.handRaisingJoiners];
                    }
                    newState.handRaisingJoiners.push(user);
                } else if (isCurrentUser) {
                    if (!newState.joiners) {
                        newState.joiners = [...state.joiners];
                    }
                    newState.joiners.unshift(user);
                } else {
                    if (!newState.joiners) {
                        newState.joiners = [...state.joiners];
                    }
                    newState.joiners.push(user);
                }
            }

            return newState as RtmState;
        }, setStateCallback);
    }

    private createUsers = async (userUUIDs: string[]): Promise<RTMUser[]> => {
        const users = await usersInfo({ roomUUID: this.props.roomId, usersUUID: userUUIDs });

        return userUUIDs.map(
            (userUUID): RTMUser => ({
                uuid: userUUID,
                rtcUID: users[userUUID].rtcUID,
                avatar: users[userUUID].avatarURL,
                name: users[userUUID].name,
                camera: userUUID !== this.props.userId,
                mic: true,
                isSpeak: false,
                isRaiseHand: false,
            }),
        );
    };

    /**
     * There are states (e.g. user camera and mic states) that are not stored in server.
     * New joined user will request these states from other users in the room.
     */
    private updateInitialRoomState = async (): Promise<void> => {
        if (this.props.identity === Identity.creator) {
            return;
        }

        const { creator } = this.state;
        if (!creator) {
            console.error("creator is empty when fetching initial group states");
            return;
        }

        // request room info from these users
        const pickedSenders: string[] = [];

        const handleChannelStatus = (
            { cStatus, uStates }: RTMEvents[RTMessageType.ChannelStatus],
            senderId: string,
        ) => {
            if (!pickedSenders.some(userUUID => userUUID === senderId)) {
                return;
            }
            this.setState({ classStatus: cStatus });
            this.sortUsers(user => {
                if (uStates[user.uuid]) {
                    const newUser = { ...user };
                    for (const code of uStates[user.uuid]) {
                        switch (code) {
                            case NonDefaultUserProp.IsSpeak: {
                                newUser.isSpeak = true;
                                break;
                            }
                            case NonDefaultUserProp.IsRaiseHand: {
                                newUser.isRaiseHand = true;
                                break;
                            }
                            case NonDefaultUserProp.Camera: {
                                newUser.camera = true;
                                break;
                            }
                            case NonDefaultUserProp.Mic: {
                                newUser.mic = true;
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }
                    return newUser;
                }
                return user;
            });
        };

        const cancelHandleChannelStatus = () => {
            this.rtm.off(RTMessageType.ChannelStatus, handleChannelStatus);
        };

        this.rtm.once(RTMessageType.ChannelStatus, handleChannelStatus);
        window.clearTimeout(this.cancelHandleChannelStatusTimeout);
        this.cancelHandleChannelStatusTimeout = window.setTimeout(cancelHandleChannelStatus, 5000);

        // creator plus joiners
        const usersTotal = 1 + this.joinersCountTotal();

        if (usersTotal <= 50) {
            // in a small room, ask creator directly for info
            pickedSenders.push(creator.uuid);
        } else {
            // too many users. pick a random user instead.
            // @TODO pick three random users
            pickedSenders.push((this.pickRandomJoiner() || creator).uuid);
        }

        for (const senderUUID of pickedSenders) {
            try {
                await this.rtm.sendCommand({
                    type: RTMessageType.RequestChannelStatus,
                    value: this.props.roomId,
                    keepHistory: false,
                    peerId: senderUUID,
                    retry: 3,
                });
            } catch (e) {
                console.error(e);
                cancelHandleChannelStatus();
            }
        }
    };

    /** number of all the joiners */
    joinersCountTotal = (): number => {
        const { joiners, handRaisingJoiners, speakingJoiners } = this.state;
        return joiners.length + handRaisingJoiners.length + speakingJoiners.length;
    };

    pickRandomJoiner = (): RTMUser | void => {
        const { joiners, handRaisingJoiners, speakingJoiners } = this.state;
        let index = Math.floor(Math.random() * this.joinersCountTotal());

        if (index < speakingJoiners.length) {
            return speakingJoiners[index];
        }

        index = index - speakingJoiners.length;
        if (index < handRaisingJoiners.length) {
            return handRaisingJoiners[index];
        }

        index = index - joiners.length;
        if (index < joiners.length) {
            return joiners[index];
        }
    };
}

export type WithRtmRouteProps = { rtm: RtmRenderProps } & RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
}>;

export function withRtmRoute<Props>(Comp: React.ComponentType<Props & WithRtmRouteProps>) {
    return class WithRtmRoute extends React.Component<
        Props & Omit<WithRtmRouteProps, "whiteboard">
    > {
        render() {
            const { uuid, userId, identity } = this.props.match.params;
            return (
                <Rtm roomId={uuid} userId={userId} identity={identity}>
                    {this.renderChildren}
                </Rtm>
            );
        }

        renderChildren = (props: RtmRenderProps) => <Comp {...this.props} rtm={props} />;
    };
}
