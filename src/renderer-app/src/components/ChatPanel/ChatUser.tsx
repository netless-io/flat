import React from "react";
import { Identity } from "../../utils/localStorage/room";
import "./ChatUser.less";

export interface RTMUser {
    id: string;
    avatar: string;
    name: string;
    camera: boolean;
    mic: boolean;
    isRaiseHand?: boolean;
}

export interface ChatUserProps {
    identity: Identity;
    creatorId?: string | null;
    userId: string;
    user: RTMUser;
    onAllowSpeaking: (uid: string) => void;
    onEndSpeaking: (uid: string) => void;
}

export class ChatUser extends React.PureComponent<ChatUserProps> {
    render(): React.ReactNode {
        const { creatorId, identity, userId, user } = this.props;
        return (
            <div className="chat-user">
                <img
                    className="chat-user-avatar"
                    src={user.avatar}
                    alt={`User ${user.name || user.id}`}
                />
                {user.name || user.id}
                {creatorId === user.id ? ( // @TODO 等待账号系统
                    <span className="chat-user-status is-teacher">(老师)</span>
                ) : user.camera || user.mic ? (
                    <>
                        <span className="chat-user-status is-speaking">(发言中)</span>
                        {(identity === Identity.creator || userId === user.id) && (
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
                                onClick={this.allowSpeaking}
                            >
                                通过
                            </button>
                        )}
                    </>
                ) : userId === user.id ? (
                    <span className="chat-user-status is-teacher">(我)</span>
                ) : null}
            </div>
        );
    }

    private endSpeaking = () => {
        const { user, onEndSpeaking } = this.props;
        if (onEndSpeaking) {
            onEndSpeaking(user.id);
        }
    };

    private allowSpeaking = () => {
        const { user, onAllowSpeaking } = this.props;
        if (onAllowSpeaking) {
            onAllowSpeaking(user.id);
        }
    };
}

export default ChatUser;
