import { observer } from "mobx-react-lite";
import React, { useLayoutEffect } from "react";
import { RTMessage, RTMessageType } from "../../apiMiddleware/Rtm";

import "./ChatMessage.less";

export type ChatMessageItem = RTMessage;

export interface ChatMessageProps {
    /** current user uuid */
    userUUID: string;
    message: ChatMessageItem;
    onLayoutMount: () => void;
}

export const ChatMessage = observer<ChatMessageProps>(function ChatMessage({
    userUUID,
    message,
    onLayoutMount,
}) {
    useLayoutEffect(() => {
        onLayoutMount();
        // run only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    if (userUUID === message.userUUID) {
        return (
            <div className="chat-message-line is-reverse">
                <div className="chat-message-bubble">{message.value}</div>
            </div>
        );
    }

    return (
        <div className="chat-message-line">
            <div className="chat-message-user">{message.userUUID}</div>
            <div className="chat-message-bubble">{message.value}</div>
        </div>
    );
});

export default ChatMessage;
