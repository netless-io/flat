import "./style.less";

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ChatMsg, ChatMsgType } from "../types";
import { useTranslation } from "react-i18next";

export interface ChatMessageProps {
    /** current user uuid */
    userUUID: string;
    messageUser?: { name: string };
    message: ChatMsg;
    onMount: () => void;
    openCloudStorage?: () => void;
}

export const ChatMessage = observer<ChatMessageProps>(function ChatMessage({
    userUUID,
    messageUser,
    message,
    onMount,
    openCloudStorage,
}) {
    const { t } = useTranslation();
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
                        <span>{message.value ? t("banned") : t("unban")}</span>
                    </div>
                </div>
            );
        }
        case ChatMsgType.UserGuide: {
            return (
                <div className="chat-message-line">
                    <div className="chat-message-user-guide-bubble">
                        <pre>
                            {t("user-guide-text")}
                            <span
                                className="chat-message-user-guide-btn"
                                onClick={openCloudStorage}
                            >
                                {t("user-guide-button")}
                            </span>
                        </pre>
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
