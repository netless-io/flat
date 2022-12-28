import "./style.less";

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { User } from "../../../types/user";
import { useTranslate } from "@netless/flat-i18n";

export interface ChatUserProps {
    /** room owner uuid */
    ownerUUID: string;
    /** current user uuid */
    userUUID: string;
    /** a user */
    user: User;
    disableEndSpeaking?: boolean;
    /** when hand raising is accepted by the teacher */
    onAcceptRaiseHand: (uid: string) => void;
    /** user stops speaking */
    onEndSpeaking: (uid: string) => void;
    /** function to generate placeholder avatar */
    generateAvatar: (uid: string) => string;
}

export const ChatUser = /* @__PURE__ */ observer<ChatUserProps>(function ChatUser({
    ownerUUID,
    userUUID,
    user,
    disableEndSpeaking,
    onAcceptRaiseHand,
    onEndSpeaking,
    generateAvatar,
}) {
    const t = useTranslate();
    const [isAvatarLoadFailed, setAvatarLoadFailed] = useState(false);
    /** is current user the room owner */
    const isCreator = ownerUUID === userUUID;
    /** is this chat user element belongs to the current user */
    const isCurrentUser = userUUID === user.userUUID;

    return (
        <div className="chat-user">
            <img
                alt={`User ${user.name}`}
                className="chat-user-avatar"
                src={isAvatarLoadFailed ? generateAvatar(userUUID) : user.avatar}
                onError={() => setAvatarLoadFailed(true)}
            />
            <span className="chat-user-name">{user.name}</span>
            {ownerUUID === user.userUUID ? (
                <span className="chat-user-status is-teacher">({t("teacher")})</span>
            ) : user.hasLeft ? (
                <>
                    <span className="chat-user-status has-left">{t("has-left")}</span>
                    {(isCreator || isCurrentUser) && !disableEndSpeaking && (
                        <button
                            className="chat-user-ctl-btn is-speaking"
                            onClick={() => onEndSpeaking(user.userUUID)}
                        >
                            {t("end")}
                        </button>
                    )}
                </>
            ) : user.isSpeak ? (
                <>
                    <span className="chat-user-status is-speaking">
                        {t("during-the-presentation")}
                    </span>
                    {(isCreator || isCurrentUser) && !disableEndSpeaking && (
                        <button
                            className="chat-user-ctl-btn is-speaking"
                            onClick={() => onEndSpeaking(user.userUUID)}
                        >
                            {t("end")}
                        </button>
                    )}
                </>
            ) : user.isRaiseHand ? (
                <>
                    <span className="chat-user-status is-hand-raising">{t("raised-hand")}</span>
                    {isCreator && (
                        <button
                            className="chat-user-ctl-btn is-hand-raising"
                            onClick={() => onAcceptRaiseHand(user.userUUID)}
                        >
                            {t("agree")}
                        </button>
                    )}
                </>
            ) : (
                isCurrentUser && <span className="chat-user-status is-teacher">{t("me")}</span>
            )}
        </div>
    );
});
