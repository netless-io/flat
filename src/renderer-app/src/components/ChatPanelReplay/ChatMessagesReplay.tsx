import React from "react";
import { RTMessage } from "../ChatPanel/ChatMessage";
import { ChatMessageListReplay } from "./ChatMessageListReplay";
import "../ChatPanel/ChatMessages.less";

export interface ChatMessagesReplayProps {
    userId: string;
    messages: RTMessage[];
}

export class ChatMessagesReplay extends React.PureComponent<ChatMessagesReplayProps> {
    renderDefault(): React.ReactNode {
        return <div className="chat-messages-default">无消息...</div>;
    }

    renderMessageList(): React.ReactNode {
        const { userId, messages } = this.props;
        return <ChatMessageListReplay userId={userId} messages={messages} />;
    }

    render(): React.ReactNode {
        return (
            <div className="chat-messages-wrap">
                <div className="chat-messages">
                    {this.props.messages.length > 0 ? (
                        <div className="chat-messages-box">{this.renderMessageList()}</div>
                    ) : (
                        this.renderDefault()
                    )}
                </div>
            </div>
        );
    }
}

export default ChatMessagesReplay;
