import React from "react";
import { ChatTypeBox, ChatTypeBoxProps } from "./ChatTypeBox";
import { RTMessage } from "./ChatMessage";
import { ChatMessageList, OnLoadMore } from "./ChatMessageList";
import noHand from "../../assets/image/no-hand.svg";
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
    isAllowRaiseHand: boolean;
}

export class ChatMessages extends React.PureComponent<ChatMessagesProps, ChatMessageState> {
    state = {
        isBan: false,
        isRaiseHand: false,
        isAllowRaiseHand: true,
    };
    // @TODO 实现禁言功能，需要后端配合
    toogleBan = () => {
        this.setState(state => ({ isBan: !state.isBan }));
    };

    // @TODO 实现老师端举手功能
    toggleAllowRaiseHand = () => {
        this.setState(state => ({ isAllowRaiseHand: !state.isAllowRaiseHand }));
    };

    // @TODO 实现学生端举手功能
    toggleRaiseHand = () => {
        this.setState(state => ({ isRaiseHand: !state.isRaiseHand }));
    };

    renderDefault(): React.ReactNode {
        return <div className="chat-messages-default">说点什么吧...</div>;
    }

    render(): React.ReactNode {
        const { identity, userId, messages, onMessageSend, onLoadMore } = this.props;
        const { isAllowRaiseHand } = this.state;
        return (
            <div className="chat-messages-wrap">
                {isAllowRaiseHand && (
                    <div className="chat-messages-cancel-hands-wrap">
                        <button
                            className="chat-messages-cancel-hands"
                            onClick={this.toggleAllowRaiseHand}
                        >
                            <img src={noHand} alt="cancel hand raising" />
                            取消举手
                        </button>
                    </div>
                )}
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
