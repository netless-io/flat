import React from "react";
import { ChatTypeBox, ChatTypeBoxProps } from "./ChatTypeBox";
import { ChatMessageItem } from "./ChatMessage";
import { ChatMessageList, OnLoadMore } from "./ChatMessageList";
import noHand from "../../assets/image/no-hand.svg";
import "./ChatMessages.less";
import { Identity } from "../../utils/localStorage/room";

export interface ChatMessagesProps {
    userId: string;
    identity: ChatTypeBoxProps["identity"];
    messages: ChatMessageItem[];
    isShowCancelHandRaising: boolean;
    onMessageSend: (text: string) => Promise<void>;
    onLoadMore: OnLoadMore;
    onCancelHandRaising: () => void;
    onSwitchHandRaising: () => void;
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

    renderDefault(): React.ReactNode {
        return <div className="chat-messages-default">说点什么吧...</div>;
    }

    render(): React.ReactNode {
        const {
            isShowCancelHandRaising,
            identity,
            userId,
            messages,
            onMessageSend,
            onLoadMore,
            onCancelHandRaising,
            onSwitchHandRaising,
        } = this.props;

        return (
            <div className="chat-messages-wrap">
                {isShowCancelHandRaising && identity === Identity.creator && (
                    <div className="chat-messages-cancel-hands-wrap">
                        <button
                            className="chat-messages-cancel-hands"
                            onClick={onCancelHandRaising}
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
                    onRaiseHandChange={onSwitchHandRaising}
                />
            </div>
        );
    }
}

export default ChatMessages;
