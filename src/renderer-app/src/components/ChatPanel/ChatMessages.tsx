import React from "react";
import { ChatTypeBox, ChatTypeBoxProps } from "./ChatTypeBox";
import { ChatMessageItem } from "./ChatMessage";
import { ChatMessageList, OnLoadMore } from "./ChatMessageList";
import "./ChatMessages.less";

export interface ChatMessagesProps {
    userId: string;
    identity: ChatTypeBoxProps["identity"];
    messages: ChatMessageItem[];
    isRaiseHand: boolean;
    onMessageSend: (text: string) => Promise<void>;
    onLoadMore: OnLoadMore;
    onSwitchHandRaising: () => void;
}

export interface ChatMessageState {
    isBan: boolean;
}

export class ChatMessages extends React.PureComponent<ChatMessagesProps, ChatMessageState> {
    state = {
        isBan: false,
    };

    // @TODO 实现禁言功能，需要后端配合
    toogleBan = () => {
        this.setState(state => ({ isBan: !state.isBan }));
    };

    renderDefault(): React.ReactNode {
        return <div className="chat-messages-default">说点什么吧...</div>;
    }

    render(): React.ReactNode {
        const {
            identity,
            userId,
            messages,
            isRaiseHand,
            onMessageSend,
            onLoadMore,
            onSwitchHandRaising,
        } = this.props;

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
                    isRaiseHand={isRaiseHand}
                    onBanChange={this.toogleBan}
                    onSend={onMessageSend}
                    onRaiseHandChange={onSwitchHandRaising}
                />
            </div>
        );
    }
}

export default ChatMessages;
