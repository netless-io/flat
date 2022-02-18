import "./style.less";

import React from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import { useTranslation } from "react-i18next";
import { ChatUser, ChatUserProps } from "../ChatUser";
import { User } from "../../../types/user";

export type ChatUsersProps = {
    isCreator: boolean;
    hasHandRaising: boolean;
    hasSpeaking: boolean;
    users: User[];
    onCancelAllHandRaising: () => void;
} & Omit<ChatUserProps, "user">;

export const ChatUsers = observer<ChatUsersProps>(function ChatUsers({
    isCreator,
    hasHandRaising,
    hasSpeaking,
    users,
    onCancelAllHandRaising,
    ...restProps
}) {
    const { t } = useTranslation();
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

    const isShowCancelAllHandRaising = isCreator && hasHandRaising;

    return (
        <div className={classNames("chat-users-wrap", { "has-speaking": hasSpeaking })}>
            {isShowCancelAllHandRaising && (
                <div className="chat-users-cancel-hands-wrap">
                    <button className="chat-users-cancel-hands" onClick={onCancelAllHandRaising}>
                        {t("cancel-hand-raising")}
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
