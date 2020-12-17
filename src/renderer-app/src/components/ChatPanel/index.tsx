import React from "react";
import { Tabs } from "antd";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import dateSub from "date-fns/sub";
import memoizeOne from "memoize-one";
import {
    Rtm,
    RTMessage,
    RTMessageText,
    RTMessageType,
    RTMRawMessage,
} from "../../apiMiddleware/Rtm";
import { generateAvatar } from "../../utils/generateAvatar";
import { Identity } from "../../utils/localStorage/room";
import { ChatMessages, ChatMessagesProps } from "./ChatMessages";
import { ChatMessageItem } from "./ChatMessage";
import { ChatUsers } from "./ChatUsers";
import { RTMUser } from "./ChatUser";

import "./ChatPanel.less";

export interface ChatPanelProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    userId: string;
    channelId: string;
    identity: ChatMessagesProps["identity"];
}

export interface ChatPanelState {
    messages: ChatMessageItem[];
    creatorId: string | null;
    users: RTMUser[];
    currentUser: RTMUser | null;
    isBan: boolean;
}

export class ChatPanel extends React.Component<ChatPanelProps, ChatPanelState> {
    private rtm = new Rtm();
    private noMoreRemoteMessages = false;

    constructor(props: ChatPanelProps) {
        super(props);

        const { identity, userId } = this.props;
        const isCreator = identity === Identity.creator;

        this.state = {
            messages: isCreator
                ? [
                      {
                          type: RTMessageType.Notice,
                          uuid: uuidv4(),
                          timestamp: Date.now(),
                          value: "点击「开始上课」才能录制并生成回放哦~",
                          userId,
                      },
                  ]
                : [],
            creatorId: isCreator ? this.props.userId : null,
            users: [],
            currentUser: null,
            isBan: false,
        };
    }

    async componentDidMount() {
        const { userId, channelId, identity } = this.props;
        const channel = await this.rtm.init(userId, channelId);
        channel.on("ChannelMessage", (msg, senderId) => {
            if (msg.messageType === Rtm.MessageType.TEXT) {
                this.handleChannelMessage(msg.text, senderId);
            }
        });

        // @TODO 使用我们自己的服务器记录类型
        if (identity === Identity.creator) {
            this.rtm.client.addOrUpdateChannelAttributes(
                channelId,
                { creatorId: userId },
                { enableNotificationToChannelMembers: true },
            );
        } else {
            channel.on("AttributesUpdated", this.updateChannelAttrs);
            this.updateChannelAttrs(await this.rtm.client.getChannelAttributes(channelId));
        }

        this.updateHistory();

        const members = await channel.getMembers();
        this.setState(
            () => ({
                users: members.map(uid => ({
                    id: uid,
                    // @TODO 等待登陆系统接入
                    avatar: generateAvatar(uid),
                    name: "",
                })),
            }),
            () => {
                this.updateUsers();
            },
        );
        channel.on("MemberJoined", uid => {
            this.setState(
                state =>
                    state.users.some(user => user.id === uid)
                        ? null
                        : {
                              users: [
                                  ...state.users,
                                  {
                                      id: uid,
                                      // @TODO 等待登陆系统接入
                                      avatar: generateAvatar(uid),
                                      name: "",
                                  },
                              ],
                          },
                () => {
                    this.updateUsers();
                },
            );
        });
        channel.on("MemberLeft", uid => {
            this.setState(state => ({
                users: state.users.filter(user => user.id !== uid),
            }));
        });
    }

    componentWillUnmount() {
        this.rtm.destroy();
    }

    render() {
        const { identity, userId, channelId, className, ...restProps } = this.props;
        const { creatorId, messages, users, currentUser, isBan } = this.state;
        return (
            <div {...restProps} className={classNames("chat-panel", className)}>
                <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                    <Tabs.TabPane tab="消息列表" key="messages">
                        <ChatMessages
                            userId={userId}
                            identity={identity}
                            messages={messages}
                            isRaiseHand={!!currentUser?.isRaiseHand}
                            isBan={isBan}
                            onMessageSend={this.onMessageSend}
                            onLoadMore={this.updateHistory}
                            onSwitchHandRaising={this.onSwitchHandRaising}
                            onBanChange={this.onBanChange}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="用户列表" key="users">
                        <ChatUsers
                            isShowCancelHandRaising={this.showCancelHandRaising(users, identity)}
                            creatorId={creatorId}
                            identity={identity}
                            userId={userId}
                            users={users}
                            onAllowSpeaking={this.onAllowSpeaking}
                            onEndSpeaking={this.onEndSpeaking}
                            onCancelHandRaising={this.onCancelHandRaising}
                        />
                    </Tabs.TabPane>
                </Tabs>
            </div>
        );
    }

    private handleChannelMessage = (rawText: string, senderId: string): void => {
        const { identity, userId } = this.props;
        const parsedMessage: RTMRawMessage = {
            t: RTMessageType.Text as RTMessageType,
            v: rawText as any,
        };

        try {
            const m = JSON.parse(rawText);
            if (m.t !== undefined) {
                parsedMessage.t = m.t;
                parsedMessage.v = m.v;
            }
        } catch (e) {
            // ignore legacy type
        }

        switch (parsedMessage.t) {
            case RTMessageType.Text: {
                this.addMessage(RTMessageType.Text, parsedMessage.v, senderId);
                break;
            }
            case RTMessageType.CancelHandRaising: {
                if (senderId === this.state.creatorId && identity === Identity.joiner) {
                    this.cancelHandRaising();
                }
                break;
            }
            case RTMessageType.RaiseHand: {
                this.updateUsers(
                    user => user.id === senderId,
                    user => ({
                        ...user,
                        isRaiseHand: parsedMessage.v,
                    }),
                );
                break;
            }
            case RTMessageType.Ban: {
                if (identity === Identity.joiner) {
                    this.setState(state => ({
                        isBan: parsedMessage.v,
                        messages: [
                            ...state.messages,
                            {
                                type: RTMessageType.Ban,
                                uuid: uuidv4(),
                                timestamp: Date.now(),
                                value: parsedMessage.v,
                                userId,
                            },
                        ],
                    }));
                }
                break;
            }
            case RTMessageType.Speak: {
                if (senderId === this.state.creatorId) {
                    const { uid, speak } = parsedMessage.v;
                    this.updateUsers(
                        user => user.id === uid,
                        user => ({
                            ...user,
                            isSpeaking: speak,
                            isRaiseHand: false,
                        }),
                    );
                }
                break;
            }
            case RTMessageType.Notice: {
                this.addMessage(RTMessageType.Notice, parsedMessage.v, senderId);
                break;
            }
            default:
                break;
        }
    };

    private updateChannelAttrs = (attrs: { [index: string]: { value: string } }): void => {
        if (attrs.creatorId?.value !== undefined) {
            const creatorId = attrs.creatorId.value;
            this.setState({ creatorId }, () => {
                this.updateUsers();
            });
        }
    };

    private updateHistory = async (): Promise<void> => {
        if (this.noMoreRemoteMessages) {
            return;
        }

        let messages: RTMessage[] = [];

        try {
            const oldestTimestap = this.state.messages[0]?.timestamp || Date.now();
            messages = await this.rtm.fetchHistory(
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
            (message): message is RTMessageText =>
                message.type === RTMessageType.Text || message.type === RTMessageType.Notice,
        );

        this.setState(state => ({ messages: [...textMessages, ...state.messages] }));
    };

    private onMessageSend = async (text: string): Promise<void> => {
        if (this.state.isBan) {
            return;
        }
        await this.rtm.sendMessage({ t: RTMessageType.Text, v: text });
        this.addMessage(RTMessageType.Text, text, this.props.userId);
    };

    /** Add the new message to message list */
    private addMessage = (
        type: RTMessageType.Text | RTMessageType.Notice,
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

    private onCancelHandRaising = () => {
        this.cancelHandRaising();
        this.rtm.sendMessage({ t: RTMessageType.CancelHandRaising });
    };

    /** show the calcel hand raising button */
    private showCancelHandRaising = memoizeOne(
        (users: RTMUser[], identity: Identity) =>
            identity === Identity.creator && users.some(user => user.isRaiseHand),
    );

    private cancelHandRaising = (): void => {
        this.updateUsers(
            user => !!user.isRaiseHand,
            user => ({
                ...user,
                isRaiseHand: false,
            }),
        );
    };

    private onAllowSpeaking = (uid: string): void => {
        // @TODO 允许学生发音
        alert(`允许用户 ${uid} 发言`);
        if (this.state.users[0]?.isSpeaking) {
            // only one user is allowed
            return;
        }
        this.updateUsers(
            user => user.id === uid,
            user => ({
                ...user,
                isSpeaking: true,
                isRaiseHand: false,
            }),
            () => {
                this.rtm.sendMessage({
                    t: RTMessageType.Speak,
                    v: {
                        uid,
                        speak: true,
                    },
                });
            },
        );
    };

    private onEndSpeaking = (uid: string): void => {
        // @TODO 结束学生发音
        this.updateUsers(
            user => user.id === uid,
            user => ({
                ...user,
                isRaiseHand: false,
                isSpeaking: false,
            }),
            () => {
                this.rtm.sendMessage({
                    t: RTMessageType.Speak,
                    v: {
                        uid,
                        speak: false,
                    },
                });
            },
        );
    };

    private onBanChange = (): void => {
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
                this.rtm.sendMessage({ t: RTMessageType.Ban, v: this.state.isBan });
            },
        );
    };

    // Current user who is a student raises hand
    private onSwitchHandRaising = (): void => {
        const { userId, identity } = this.props;
        const { currentUser } = this.state;
        if (identity !== Identity.joiner || currentUser?.isSpeaking) {
            return;
        }
        this.updateUsers(
            user => user.id === userId,
            user => ({
                ...user,
                isRaiseHand: !user.isRaiseHand,
            }),
            () => {
                const { currentUser } = this.state;
                if (currentUser) {
                    this.rtm.sendMessage({
                        t: RTMessageType.RaiseHand,
                        v: !!currentUser.isRaiseHand,
                    });
                }
            },
        );
    };

    private updateUsers(): void;
    private updateUsers(
        shouldChange: (user: RTMUser) => boolean,
        updateUser: (user: RTMUser, state: ChatPanelState) => RTMUser,
        setStateCallback?: () => void,
    ): void;
    private updateUsers(
        shouldChange?: (user: RTMUser) => boolean,
        updateUser?: (user: RTMUser, state: ChatPanelState) => RTMUser,
        setStateCallback?: () => void,
    ): void {
        this.setState(state => {
            const { users, creatorId } = state;
            const { userId } = this.props;
            const speakingUsers: RTMUser[] = [];
            const raiseHandUsers: RTMUser[] = [];
            const middle: RTMUser[] = [];
            const newUsers: RTMUser[] = [];
            let currentUser: RTMUser | null = null;

            let hasUpdate = false;

            for (let user of users) {
                if (shouldChange && shouldChange(user)) {
                    const newUser = updateUser!(user, state);
                    if (user !== newUser) {
                        hasUpdate = true;
                        user = newUser;
                    }
                }

                const isCurrentUser = user.id === userId;
                if (isCurrentUser) {
                    currentUser = user;
                }

                if (user.isSpeaking) {
                    speakingUsers.push(user);
                } else if (user.isRaiseHand) {
                    raiseHandUsers.push(user);
                } else if (user.id === creatorId) {
                    if (middle.length < 0 || user !== middle[0]) {
                        middle.unshift(user);
                    }
                } else if (isCurrentUser) {
                    if (middle.length < 0 || user !== middle[0]) {
                        middle.push(user);
                    }
                } else {
                    newUsers.push(user);
                }
            }

            if (!shouldChange || hasUpdate) {
                return {
                    users: [...speakingUsers, ...raiseHandUsers, ...middle, ...newUsers],
                    currentUser,
                };
            }

            return null;
        }, setStateCallback);
    }
}

export default ChatPanel;
