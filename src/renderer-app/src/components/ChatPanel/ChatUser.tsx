import React from "react";
import { User } from "../../stores/ClassRoomStore";
import { Identity } from "../../utils/localStorage/room";
import "./ChatUser.less";

export type { User } from "../../stores/ClassRoomStore";
export interface ChatUserProps {
    identity: Identity;
    creatorId?: string | null;
    userId: string;
    user: User;
    onAcceptRaiseHand: (uid: string) => void;
    onEndSpeaking: (uid: string) => void;
}

export class ChatUser extends React.PureComponent<ChatUserProps> {
    render(): React.ReactNode {
        const { creatorId, identity, userId, user } = this.props;
        return (
            <div className="chat-user">
                <img className="chat-user-avatar" src={user.avatar} alt={`User ${user.name}`} />
                {user.name}
                {creatorId === user.userUUID ? (
                    <span className="chat-user-status is-teacher">(老师)</span>
                ) : user.isSpeak ? (
                    <>
                        <span className="chat-user-status is-speaking">(发言中)</span>
                        {(identity === Identity.creator || userId === user.userUUID) && (
                            <button
                                className="chat-user-ctl-btn is-speaking"
                                onClick={this.endSpeaking}
                            >
                                结束
                            </button>
                        )}
                    </>
                ) : user.isRaiseHand ? (
                    <>
                        <span className="chat-user-status is-hand-raising">(已举手)</span>
                        {identity === Identity.creator && (
                            <button
                                className="chat-user-ctl-btn is-hand-raising"
                                onClick={this.acceptRaiseHand}
                            >
                                通过
                            </button>
                        )}
                    </>
                ) : userId === user.userUUID ? (
                    <span className="chat-user-status is-teacher">(我)</span>
                ) : null}
            </div>
        );
    }

    private endSpeaking = (): void => {
        const { user, onEndSpeaking } = this.props;
        if (onEndSpeaking) {
            onEndSpeaking(user.userUUID);
        }
    };

    private acceptRaiseHand = (): void => {
        const { user, onAcceptRaiseHand } = this.props;
        if (onAcceptRaiseHand) {
            onAcceptRaiseHand(user.userUUID);
        }
    };
}

export default ChatUser;
