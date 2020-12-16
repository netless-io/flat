import React from "react";
import classNames from "classnames";

import "./ChatMessage.less";

export interface ChatMessageItem {
    uuid: string;
    timestamp: number;
    value: string;
    userId: string;
}

export interface ChatMessageProps {
    userId: string;
    message: ChatMessageItem;
    onLoaded: () => void;
}

export class ChatMessage extends React.Component<ChatMessageProps> {
    componentDidMount() {
        this.props.onLoaded();
    }

    render(): React.ReactNode {
        const { userId, message } = this.props;

        return (
            <div
                className={classNames("chat-message-line", {
                    "is-reverse": userId === message.userId,
                })}
            >
                <div className="chat-message-user">{message.userId}</div>
                <div className="chat-message-bubble">{message.value}</div>
            </div>
        );
    }
}

export default ChatMessage;
