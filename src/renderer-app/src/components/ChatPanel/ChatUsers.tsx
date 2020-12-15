import React from "react";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import { ChatUser, ChatUserProps, RTMUser } from "./ChatUser";
import "./ChatUsers.less";

export interface ChatUsersProps
    extends Pick<ChatUserProps, "identity" | "userId" | "onAllowSpeaking" | "onEndSpeaking"> {
    users: RTMUser[];
}

export class ChatUsers extends React.PureComponent<ChatUsersProps> {
    render(): React.ReactNode {
        return (
            <div className="chat-users-wrap">
                <div className="chat-users">
                    <AutoSizer>{this.renderList}</AutoSizer>
                </div>
            </div>
        );
    }

    private renderList = ({ height, width }: Size): React.ReactNode => {
        return (
            <List
                height={height}
                width={width}
                rowCount={this.props.users.length}
                rowHeight={40}
                rowRenderer={this.rowRenderer}
            />
        );
    };

    private rowRenderer: ListRowRenderer = ({ index, style }): React.ReactNode => {
        const { users, ...restProps } = this.props;
        const user = users[index];
        return (
            <div key={user.id} style={style}>
                <ChatUser {...restProps} user={user} />
            </div>
        );
    };
}

export default ChatUsers;
