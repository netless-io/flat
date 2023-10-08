import "./style.less";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { format } from "date-fns";
import { ChatMsg } from "../types";

export interface ChatMessageProps {
    /** current user uuid */
    userUUID: string;
    messageUser?: { name: string; avatar: string };
    message: ChatMsg;
    onMount: () => void;
    generateAvatar: (uid: string) => string;
    openCloudStorage?: () => void;
}

export const ChatMessage = /* @__PURE__ */ observer<ChatMessageProps>(function ChatMessage({
    userUUID,
    messageUser,
    message,
    onMount,
    generateAvatar,
    openCloudStorage,
}) {
    const t = useTranslate();
    const [isAvatarLoadFailed, setAvatarLoadFailed] = useState(false);

    const avatar =
        isAvatarLoadFailed || !messageUser?.avatar ? generateAvatar(userUUID) : messageUser.avatar;

    useEffect(() => {
        onMount();
        // run only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    switch (message.type) {
        case "notice": {
            return (
                <div className="chat-message-line">
                    <div className="chat-message-notice">{message.text}</div>
                </div>
            );
        }
        case "ban": {
            return (
                <div className="chat-message-line">
                    <div className="chat-message-ban">
                        <span>{message.status ? t("banned") : t("unban")}</span>
                    </div>
                </div>
            );
        }
        case "user-guide": {
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

    const time = new Date(message.timestamp);
    const fullTimeString = format(time, "yyyy-MM-dd HH:mm");
    const [dateString, timeString] = fullTimeString.split(" ");
    const dateToday = format(new Date(), "yyyy-MM-dd");
    const finalTimeString = dateString === dateToday ? timeString : fullTimeString;

    if (userUUID === message.senderID) {
        return (
            <div className="chat-message-line is-reverse">
                <div className="chat-message-avatar">
                    <span className="chat-message-user-avatar">
                        <img
                            alt="[avatar]"
                            src={avatar}
                            onError={() => avatar && setAvatarLoadFailed(true)}
                        />
                    </span>
                </div>
                <div className="chat-message-user-bubble">
                    <div className="chat-message-user">
                        <span className="chat-message-user-name">
                            {messageUser?.name || message.senderID}
                        </span>
                        <time
                            className="chat-message-user-time"
                            dateTime={time.toISOString()}
                            title={time.toLocaleString()}
                        >
                            {finalTimeString}
                        </time>
                    </div>
                    <div className="chat-message-bubble is-self">
                        <pre>{message.text}</pre>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-message-line">
            <div className="chat-message-avatar">
                <span className="chat-message-user-avatar">
                    <img
                        alt="[avatar]"
                        src={avatar}
                        onError={() => avatar && setAvatarLoadFailed(true)}
                    />
                </span>
            </div>
            <div className="chat-message-user-bubble">
                <div className="chat-message-user">
                    <span className="chat-message-user-name">
                        {messageUser?.name || message.senderID}
                    </span>
                    <time
                        className="chat-message-user-time"
                        dateTime={time.toISOString()}
                        title={time.toLocaleString()}
                    >
                        {finalTimeString}
                    </time>
                </div>
                <div className="chat-message-bubble">
                    <pre>{message.text}</pre>
                </div>
            </div>
        </div>
    );
});
