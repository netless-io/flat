import React from "react";
import { ChatTypeBox, ChatTypeBoxProps } from "./ChatTypeBox";
import { RTMessage } from "./ChatMessage";
import { ChatMessageList, OnLoadMore } from "./ChatMessageList";
import "./ChatMessages.less";

export interface ChatMessagesProps {
    userId: string;
    identity: ChatTypeBoxProps["identity"];
    messages: RTMessage[];
    onMessageSend: (text: string) => Promise<void>;
    onLoadMore: OnLoadMore;
}

export interface ChatMessageState {
    isBan: boolean;
    isRaiseHand: boolean;
}

export class ChatMessages extends React.PureComponent<ChatMessagesProps, ChatMessageState> {
    state = {
        isBan: false,
        isRaiseHand: false,
    };
    // @TODO 实现禁言功能，需要后端配合
    toogleBan = () => {
        this.setState(state => ({ isBan: !state.isBan }));
    };

    // @TODO 实现举手功能
    toggleRaiseHand = () => {
        this.setState(state => ({ isRaiseHand: !state.isRaiseHand }));
    };

    renderDefault(): React.ReactNode {
        return <div className="chat-messages-default">说点什么吧...</div>;
    }

    render(): React.ReactNode {
        const { identity, userId, messages, onMessageSend, onLoadMore } = this.props;
        return (
            <div className="chat-messages-wrap">
                <div className="chat-messages">
                    {messages.length > 0 ? (
                        <div className="chat-messages-box">
                            <ChatMessageList
                                userId={userId}
                                messages={messages}
                                onLoadMore={onLoadMore}
                            />
                        </div>
                    ) : (
                        this.renderDefault()
                    )}
                </div>
                <ChatTypeBox
                    identity={identity}
                    isBan={this.state.isBan}
                    isRaiseHand={this.state.isRaiseHand}
                    onBanChange={this.toogleBan}
                    onSend={onMessageSend}
                    onRaiseHandChange={this.toggleRaiseHand}
                />
            </div>
        );
    }
}

export default ChatMessages;
