import React from "react";
import "./ChatUser.less";

export interface RTMUser {
    id: string;
    avatar: string;
    name: string;
}

export interface ChatUserProps {
    userId: string;
    user: RTMUser;
}

export class ChatUser extends React.PureComponent<ChatUserProps> {
    render(): React.ReactNode {
        const { userId, user } = this.props;
        return (
            <div className="chat-user">
                <img
                    className="chat-user-avatar"
                    src={user.avatar}
                    alt={`User ${user.name || user.id}`}
                />
                {(user.name || user.id) + (userId === user.id ? " (我)" : "")}
            </div>
        );
    }
}

export default ChatUser;
