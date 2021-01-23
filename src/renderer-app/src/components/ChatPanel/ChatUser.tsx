import { observer } from "mobx-react-lite";
import React from "react";
import { User } from "../../stores/ClassRoomStore";
import "./ChatUser.less";

export type { User } from "../../stores/ClassRoomStore";

export interface ChatUserProps {
    /** room owner uuid */
    ownerUUID: string;
    /** current user uuid */
    userUUID: string;
    /** a user */
    user: User;
    /** when hand reising is accepted by the teacher */
    onAcceptRaiseHand: (uid: string) => void;
    /** user stops speaking */
    onEndSpeaking: (uid: string) => void;
}

export const ChatUser = observer<ChatUserProps>(function ChatUser({
    ownerUUID,
    userUUID,
    user,
    onAcceptRaiseHand,
    onEndSpeaking,
}) {
    /** is current user the room owner */
    const isCreator = ownerUUID === userUUID;
    /** is this chat user element belongs to the current user */
    const isCurrentUser = userUUID === user.userUUID;

    return (
        <div className="chat-user">
            <img className="chat-user-avatar" src={user.avatar} alt={`User ${user.name}`} />
            {user.name}
            {ownerUUID === user.userUUID ? (
                <span className="chat-user-status is-teacher">(老师)</span>
            ) : user.isSpeak ? (
                <>
                    <span className="chat-user-status is-speaking">(发言中)</span>
                    {(isCreator || isCurrentUser) && (
                        <button
                            className="chat-user-ctl-btn is-speaking"
                            onClick={() => onEndSpeaking(user.userUUID)}
                        >
                            结束
                        </button>
                    )}
                </>
            ) : user.isRaiseHand ? (
                <>
                    <span className="chat-user-status is-hand-raising">(已举手)</span>
                    {isCreator && (
                        <button
                            className="chat-user-ctl-btn is-hand-raising"
                            onClick={() => onAcceptRaiseHand(user.userUUID)}
                        >
                            通过
                        </button>
                    )}
                </>
            ) : isCurrentUser ? (
                <span className="chat-user-status is-teacher">(我)</span>
            ) : null}
        </div>
    );
});

export default ChatUser;
