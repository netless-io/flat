import React from "react";
import classNames from "classnames";

import "./ChatMessage.less";

export interface RTMessage {
    uuid: string;
    timestamp: number;
    text: string;
    userId: string;
}

export interface ChatMessageProps {
    userId: string;
    message: RTMessage;
}

export class ChatMessage extends React.PureComponent<ChatMessageProps> {
    render(): React.ReactNode {
        const { userId, message } = this.props;

        return (
            <div
                className={classNames("chat-message-line", {
                    "is-reverse": userId === message.userId,
                })}
            >
                <div className="chat-message-user">{message.userId}</div>
                <div className="chat-message-bubble">{message.text}</div>
            </div>
        );
    }
}

export default ChatMessage;
