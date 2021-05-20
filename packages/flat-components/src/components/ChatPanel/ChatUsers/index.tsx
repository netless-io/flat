import "./style.less";
import noHandSVG from "./icons/no-hand.svg";

import React from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import { ChatUser, ChatUserProps } from "../ChatUser";
import { User } from "../../../types/user";

export type ChatUsersProps = {
    isCreator: boolean;
    hasHandRaisingJoiners: boolean;
    hasSpeaking: boolean;
    users: User[];
    onCancelAllHandRaising: () => void;
} & ChatUserProps;

export const ChatUsers = observer<ChatUsersProps>(function ChatUsers({
    isCreator,
    hasHandRaisingJoiners,
    hasSpeaking,
    users,
    onCancelAllHandRaising,
    ...restProps
}) {
    const rowRenderer: ListRowRenderer = ({ index, style }): React.ReactNode => {
        const user = users[index];
        return (
            <div key={user.userUUID} style={style}>
                <ChatUser {...restProps} user={user} />
            </div>
        );
    };

    const renderList = ({ height, width }: Size): React.ReactNode => {
        return (
            <List
                className="fancy-scrollbar"
                height={height}
                width={width}
                rowCount={users.length}
                rowHeight={40}
                rowRenderer={rowRenderer}
                data={users}
            />
        );
    };

    const isShowCancelAllHandRaising = isCreator && hasHandRaisingJoiners;

    return (
        <div className={classNames("chat-users-wrap", { "has-speaking": hasSpeaking })}>
            {isShowCancelAllHandRaising && (
                <div className="chat-users-cancel-hands-wrap">
                    <button className="chat-users-cancel-hands" onClick={onCancelAllHandRaising}>
                        <img src={noHandSVG} alt="cancel hand raising" />
                        取消举手
                    </button>
                </div>
            )}
            <div
                className={classNames("chat-users", {
                    "with-cancel-hands": isShowCancelAllHandRaising,
                })}
            >
                <AutoSizer>{renderList}</AutoSizer>
            </div>
        </div>
    );
});
