import React from "react";
import ChatTypeBox from "./ChatTypeBox";
import ChatMessage, { RTMessage } from "./ChatMessage";
import "./ChatMessages.less";

export interface ChatMessagesProps {
    userId: string;
    isRoomOwner: boolean;
    messages: RTMessage[];
    onMessageSend: (text: string) => Promise<void>;
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
        const { isRoomOwner, userId, messages, onMessageSend } = this.props;
        return (
            <div className="chat-messages-wrap">
                <div className="chat-messages">
                    {messages.length > 0 ? (
                        <div className="chat-messages-box">
                            {messages.map(message => (
                                <ChatMessage key={message.uuid} userId={userId} message={message} />
                            ))}
                        </div>
                    ) : (
                        this.renderDefault()
                    )}
                </div>
                <ChatTypeBox
                    isRoomOwner={isRoomOwner}
                    isBan={this.state.isBan}
                    onBanChange={this.toogleBan}
                    onSend={onMessageSend}
                />
            </div>
        );
    }
}

export default ChatMessages;
