import React from "react";
import { RTMessage, RTMessageType } from "../../apiMiddleware/Rtm";

import "./ChatMessage.less";

export type ChatMessageItem = RTMessage;

export interface ChatMessageProps {
    userId: string;
    message: ChatMessageItem;
    onLoaded: () => void;
}

export class ChatMessage extends React.Component<ChatMessageProps> {
    componentDidMount(): void {
        this.props.onLoaded();
    }

    render(): React.ReactNode {
        const { userId, message } = this.props;

        switch (message.type) {
            case RTMessageType.Notice: {
                return (
                    <div className="chat-message-line">
                        <div className="chat-message-notice">{message.value}</div>
                    </div>
                );
            }
            case RTMessageType.BanText: {
                return (
                    <div className="chat-message-line">
                        <div className="chat-message-ban">
                            <span>{message.value ? "已禁言" : "已解除禁言"}</span>
                        </div>
                    </div>
                );
            }
            default:
                break;
        }

        if (userId === message.userId) {
            return (
                <div className="chat-message-line is-reverse">
                    <div className="chat-message-bubble">{message.value}</div>
                </div>
            );
        }

        return (
            <div className="chat-message-line">
                <div className="chat-message-user">{message.userId}</div>
                <div className="chat-message-bubble">{message.value}</div>
            </div>
        );
    }
}

export default ChatMessage;
