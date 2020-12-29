import React from "react";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import classNames from "classnames";
import { ChatUser, ChatUserProps, RTMUser } from "./ChatUser";
import noHand from "../../assets/image/no-hand.svg";
import "./ChatUsers.less";

export interface ChatUsersProps
    extends Pick<
        ChatUserProps,
        "creatorId" | "identity" | "userId" | "onAcceptRaiseHand" | "onEndSpeaking"
    > {
    users: RTMUser[];
    isShowCancelAllHandRaising: boolean;
    onCancelAllHandRaising: () => void;
}

export class ChatUsers extends React.PureComponent<ChatUsersProps> {
    render(): React.ReactNode {
        const { users, isShowCancelAllHandRaising, onCancelAllHandRaising } = this.props;

        return (
            <div
                className={classNames("chat-users-wrap", {
                    "has-speaking": users[0]?.camera || users[0]?.mic,
                })}
            >
                {isShowCancelAllHandRaising && (
                    <div className="chat-users-cancel-hands-wrap">
                        <button
                            className="chat-users-cancel-hands"
                            onClick={onCancelAllHandRaising}
                        >
                            <img src={noHand} alt="cancel hand raising" />
                            取消举手
                        </button>
                    </div>
                )}
                <div
                    className={classNames("chat-users", {
                        "with-cancel-hands": isShowCancelAllHandRaising,
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
