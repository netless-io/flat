import React from "react";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import classNames from "classnames";
import { ChatUser, ChatUserProps, RTMUser } from "./ChatUser";
import { Identity } from "../../utils/localStorage/room";
import noHand from "../../assets/image/no-hand.svg";
import "./ChatUsers.less";

export interface ChatUsersProps
    extends Pick<
        ChatUserProps,
        "creatorId" | "identity" | "userId" | "onAllowSpeaking" | "onEndSpeaking"
    > {
    users: RTMUser[];
    isShowCancelHandRaising: boolean;
    onCancelHandRaising: () => void;
}

export class ChatUsers extends React.PureComponent<ChatUsersProps> {
    render(): React.ReactNode {
        const { isShowCancelHandRaising, identity, onCancelHandRaising } = this.props;

        return (
            <div className="chat-users-wrap">
                {isShowCancelHandRaising && identity === Identity.creator && (
                    <div className="chat-users-cancel-hands-wrap">
                        <button className="chat-users-cancel-hands" onClick={onCancelHandRaising}>
                            <img src={noHand} alt="cancel hand raising" />
                            取消举手
                        </button>
                    </div>
                )}
                <div
                    className={classNames("chat-users", {
                        "with-cancel-hands": isShowCancelHandRaising,
                    })}
                >
                    <AutoSizer>{this.renderList}</AutoSizer>
                </div>
            </div>
        );
    }

    private renderList = ({ height, width }: Size): React.ReactNode => {
        const { users } = this.props;
        return (
            <List
                height={height}
                width={width}
                rowCount={users.length}
                rowHeight={40}
                rowRenderer={this.rowRenderer}
                date={users}
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
