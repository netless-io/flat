import "./style.less";

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";

export enum ChatMsgType {
    Notice = "Notice",
    BanText = "BanText",
    ChannelMessage = "ChannelMessage",
}

export interface ChatMsg {
    uuid: string;
    type: ChatMsgType;
    value: string;
    userUUID: string;
    timestamp: number;
}

export interface ChatMessageProps {
    /** current user uuid */
    userUUID: string;
    messageUser?: { name: string };
    message: ChatMsg;
    onMount: () => void;
}

export const ChatMessage = observer<ChatMessageProps>(function ChatMessage({
    userUUID,
    messageUser,
    message,
    onMount,
}) {
    useEffect(() => {
        onMount();
        // run only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    switch (message.type) {
        case ChatMsgType.Notice: {
            return (
                <div className="chat-message-line">
                    <div className="chat-message-notice">{message.value}</div>
                </div>
            );
        }
        case ChatMsgType.BanText: {
            return (
                <div className="chat-message-line">
                    <div className="chat-message-ban">
                        <span>{message.value ? "已禁言" : "已解除禁言"}</span>
                    </div>
                </div>
            );
        }
        default: {
            break;
        }
    }

    if (userUUID === message.userUUID) {
        return (
            <div className="chat-message-line is-reverse">
                <div className="chat-message-user">{messageUser?.name || message.userUUID}</div>
                <div className="chat-message-bubble">
                    <pre>{message.value}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-message-line">
            <div className="chat-message-user">{messageUser?.name || message.userUUID}</div>
            <div className="chat-message-bubble">
                <pre>{message.value}</pre>
            </div>
        </div>
    );
});
