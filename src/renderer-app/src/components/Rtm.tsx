import React from "react";
import { RouteComponentProps } from "react-router";
import { v4 as uuidv4 } from "uuid";
import dateSub from "date-fns/sub";
import { Rtm as RtmApi, RTMessage, RTMessageType } from "../apiMiddleware/Rtm";
import { generateAvatar } from "../utils/generateAvatar";
import { Identity } from "../utils/localStorage/room";
import { ChatMessageItem } from "./ChatPanel/ChatMessage";
import { RTMUser } from "./ChatPanel/ChatUser";

export interface RtmRenderProps extends RtmState {
    rtm: RtmApi;
    updateHistory: () => Promise<void>;
    acceptRaisehand: (uid: string) => void;
    onMessageSend: (text: string) => Promise<void>;
    onCancelAllHandRaising: () => void;
    onToggleHandRaising: () => void;
    onToggleBan: () => void;
    allowSpeak: (uid: string, camera: boolean, mic: boolean) => void;
    speak: (camera: boolean, mic: boolean) => void;
    bindOnSpeak: (onSpeak: (uid: string, speak: boolean) => void) => void;
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
    creator: RTMUser | null;
    joiners: RTMUser[];
    currentUser: RTMUser | null;
    isBan: boolean;
};

export class Rtm extends React.Component<RtmProps, RtmState> {
    private rtm = new RtmApi();
    private noMoreRemoteMessages = false;

    constructor(props: RtmProps) {
        super(props);

        const creator: RTMUser | null =
            this.props.identity === Identity.creator ? this.createUser(this.props.userId) : null;
        this.state = {
            messages: [],
            speakingJoiners: [],
            handRaisingJoiners: [],
            creator,
            joiners: [],
            currentUser: null,
            isBan: false,
        };
    }

    async componentDidMount() {
        const { userId, roomId, identity } = this.props;
        const channel = await this.rtm.init(userId, roomId);
        this.startListenChannel();

        // @TODO 使用我们自己的服务器记录类型
        if (identity === Identity.creator) {
            this.rtm.client.addOrUpdateChannelAttributes(
                roomId,
                { creatorId: userId },
                { enableNotificationToChannelMembers: true },
            );
        } else {
            channel.on("AttributesUpdated", this.updateChannelAttrs);
            this.updateChannelAttrs(await this.rtm.client.getChannelAttributes(roomId));
        }

        this.updateHistory();

        const members = await channel.getMembers();
        this.sortUsers(members.map(this.createUser));

        channel.on("MemberJoined", uid => {
            this.sortUsers([this.createUser(uid)]);
        });
        channel.on("MemberLeft", uid => {
            this.setState(state => ({
                joiners: state.joiners.filter(user => user.id !== uid),
            }));
        });
    }

    componentWillUnmount() {
        this.rtm.destroy();
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
            allowSpeak: this.allowSpeak,
            speak: this.speak,
            bindOnSpeak: this.bindOnSpeak,
        });
    }

    onSpeak = (_uid: string, _speak: boolean): void => {};

    private bindOnSpeak = (onSpeak: (uid: string, speak: boolean) => void): void => {
        this.onSpeak = onSpeak;
    };

    private acceptRaisehand = (uid: string): void => {
        this.rtm.sendCommand(RTMessageType.AcceptRaiseHand, { uid, accept: true });
    };

    private onMessageSend = async (text: string): Promise<void> => {
        if (this.state.isBan && this.props.identity !== Identity.creator) {
            return;
        }
        await this.rtm.sendMessage(text);
        this.addMessage(RTMessageType.ChannelMessage, text, this.props.userId);
    };

    private onCancelAllHandRaising = (): void => {
        this.cancelAllHandRaising();
        this.rtm.sendCommand(RTMessageType.CancelAllHandRaising, true, true);
    };

    /** Creator requests joiner to change camera and mic state */
    private allowSpeak = (uid: string, camera: boolean, mic: boolean): void => {
        const { userId, identity } = this.props;
        if (identity !== Identity.creator) {
            return;
        }

        this.sortUsers(
            user => {
                if (user.id === uid) {
                    // creator can turn off joiner's camera and mic
                    // creator can request joiner to turn on camera and mic
                    if (uid !== userId) {
                        if (camera && !user.camera) {
                            camera = user.camera;
                        }

                        if (mic && !user.mic) {
                            mic = user.mic;
                        }
                    }

                    if (camera !== user.camera || mic !== user.mic) {
                        return {
                            ...user,
                            isRaiseHand: false,
                            camera,
                            mic,
                        };
                    }
                }
                return user;
            },
            () => {
                this.onSpeak(uid, Boolean(camera || mic));
                this.rtm.sendCommand(RTMessageType.AllowSpeak, { uid, camera, mic }, true);
            },
        );
    };

    /** joiner updates own camera and mic state */
    private speak = (camera: boolean, mic: boolean): void => {
        const { userId } = this.props;

        this.sortUsers(
            user =>
                user.id === userId
                    ? {
                          ...user,
                          camera,
                          mic,
                      }
                    : user,
            () => {
                this.onSpeak(userId, Boolean(camera || mic));
                this.rtm.sendCommand(RTMessageType.Speak, { camera, mic }, true);
            },
        );
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
                        type: RTMessageType.Ban,
                        uuid: uuidv4(),
                        timestamp: Date.now(),
                        value: !state.isBan,
                        userId,
                    },
                ],
            }),
            () => {
                this.rtm.sendCommand(RTMessageType.Ban, this.state.isBan, true);
            },
        );
    };

    // Current user (who is a joiner) raises hand
    private onToggleHandRaising = (): void => {
        const { userId, identity } = this.props;
        const { currentUser } = this.state;
        if (identity !== Identity.joiner || currentUser?.camera || currentUser?.mic) {
            return;
        }
        this.sortUsers(
            user =>
                user.id === userId
                    ? {
                          ...user,
                          isRaiseHand: !user.isRaiseHand,
                      }
                    : user,
            () => {
                const { currentUser } = this.state;
                if (currentUser) {
                    this.rtm.sendCommand(RTMessageType.RaiseHand, !!currentUser.isRaiseHand, true);
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
        this.sortUsers(user =>
            user.isRaiseHand
                ? {
                      ...user,
                      isRaiseHand: false,
                  }
                : user,
        );
    };

    private startListenChannel = (): void => {
        this.rtm.on(RTMessageType.ChannelMessage, (text, senderId) => {
            this.addMessage(RTMessageType.ChannelMessage, text, senderId);
        });

        this.rtm.on(RTMessageType.CancelAllHandRaising, (_value, senderId) => {
            if (senderId === this.state.creator?.id && this.props.identity === Identity.joiner) {
                this.cancelAllHandRaising();
            }
        });

        this.rtm.on(RTMessageType.RaiseHand, (isRaiseHand, senderId) => {
            this.sortUsers(user =>
                user.id === senderId
                    ? {
                          ...user,
                          isRaiseHand,
                      }
                    : user,
            );
        });

        this.rtm.on(RTMessageType.AcceptRaiseHand, ({ uid, accept }, senderId) => {
            if (senderId === this.state.creator?.id && uid === this.props.userId) {
                this.sortUsers(user =>
                    uid === user.id
                        ? {
                              ...user,
                              isRaiseHand: false,
                              camera: false,
                              mic: accept,
                          }
                        : user,
                );
            }
        });

        this.rtm.on(RTMessageType.Ban, isBan => {
            if (this.props.identity === Identity.joiner) {
                this.setState(state => ({
                    isBan,
                    messages: [
                        ...state.messages,
                        {
                            type: RTMessageType.Ban,
                            uuid: uuidv4(),
                            timestamp: Date.now(),
                            value: isBan,
                            userId: this.props.userId,
                        },
                    ],
                }));
            }
        });

        this.rtm.on(RTMessageType.Speak, ({ camera, mic }, senderId) => {
            this.sortUsers(
                user =>
                    user.id === senderId
                        ? {
                              ...user,
                              camera,
                              mic,
                          }
                        : user,
                () => {
                    this.onSpeak(senderId, camera || mic);
                },
            );
        });

        this.rtm.on(RTMessageType.AllowSpeak, ({ uid, camera, mic }, senderId) => {
            if (senderId === this.state.creator?.id) {
                this.sortUsers(
                    user =>
                        user.id === uid
                            ? {
                                  ...user,
                                  camera,
                                  mic,
                              }
                            : user,
                    () => {
                        this.onSpeak(uid, camera || mic);
                    },
                );
            }
        });

        this.rtm.on(RTMessageType.Notice, (text, senderId) => {
            this.addMessage(RTMessageType.Notice, text, senderId);
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

    private updateChannelAttrs = (attrs: { [index: string]: { value: string } }): void => {
        if (attrs.creatorId?.value !== undefined) {
            const creatorId = attrs.creatorId.value;
            this.setState(state => ({
                creator: state.creator
                    ? {
                          ...state.creator,
                          id: creatorId,
                      }
                    : this.createUser(creatorId),
            }));
        }
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

                (["speakingJoiners", "handRaisingJoiners", "joiners"] as const).forEach(key => {
                    for (let i = 0; i < state[key].length; i++) {
                        const user = state[key][i];
                        const mappedUser = mapUser(user, state);
                        if (user !== mappedUser) {
                            if (!newState[key]) {
                                newState[key] = state.joiners.slice(0, i);
                            }
                            unSortedUsers.push(mappedUser);
                            continue;
                        }
                        newState[key]?.push(user);
                    }
                });
            }

            for (const user of unSortedUsers) {
                const isCurrentUser = user.id === userId;

                if (isCurrentUser) {
                    newState.currentUser = user;
                }

                if (user.id === state.creator?.id) {
                    newState.creator = user;
                } else if (user.camera || user.mic) {
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

    private createUser = (uid: string): RTMUser => {
        return {
            id: uid,
            // @TODO 等待登陆系统接入
            avatar: generateAvatar(uid),
            name: "",
            camera: uid !== this.props.userId,
            mic: false,
        };
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
