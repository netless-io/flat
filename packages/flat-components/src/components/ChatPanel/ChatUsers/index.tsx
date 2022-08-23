import "./style.less";

import React from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import { useTranslate } from "@netless/flat-i18n";
import { ChatUser, ChatUserProps } from "../ChatUser";
import { User } from "../../../types/user";

export type ChatUsersProps = {
    isCreator: boolean;
    hasHandRaising?: boolean;
    withAcceptHands: boolean;
    users: User[];
    onCancelAllHandRaising: () => void;
} & Omit<ChatUserProps, "user">;

export const ChatUsers = /* @__PURE__ */ observer<ChatUsersProps>(function ChatUsers({
    isCreator,
    hasHandRaising,
    withAcceptHands,
    users,
    onCancelAllHandRaising,
    ...restProps
}) {
    const t = useTranslate();
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
                data={users}
                height={height}
                rowCount={users.length}
                rowHeight={48}
                rowRenderer={rowRenderer}
                width={width}
            />
        );
    };

    return (
        <div className={classNames("chat-users-wrap", { "with-accept-hands": withAcceptHands })}>
            {isCreator && hasHandRaising && (
                <div className="chat-users-cancel-hands-wrap">
                    <button className="chat-users-cancel-hands" onClick={onCancelAllHandRaising}>
                        {t("cancel-hand-raising")}
                    </button>
                </div>
            )}
            <div
                className={classNames("chat-users", {
                    "with-cancel-hands": isCreator && hasHandRaising,
                })}
            >
                <AutoSizer>{renderList}</AutoSizer>
            </div>
        </div>
    );
});
