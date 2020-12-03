import React from "react";
import { ChatUser, RTMUser } from "./ChatUser";
import "./ChatUsers.less";

export interface ChatUsersProps {
    userId: string;
    users: RTMUser[];
}

export class ChatUsers extends React.PureComponent<ChatUsersProps> {
    render(): React.ReactNode {
        const { userId, users } = this.props;

        return (
            <div className="chat-users-wrap">
                <div className="chat-users">
                    {users.map(user => (
                        <ChatUser key={user.id} user={user} userId={userId} />
                    ))}
                </div>
            </div>
        );
    }
}

export default ChatUsers;
