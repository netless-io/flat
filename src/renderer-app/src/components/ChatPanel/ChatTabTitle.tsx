import React, { FC, useMemo } from "react";
import classNames from "classnames";
import "./ChatTabTitle.less";

export interface ChatTabTitleProps {
    unreadCount?: number | null;
}

export const ChatTabTitle: FC<ChatTabTitleProps> = ({ unreadCount, children }) => {
    const count = useMemo(
        () =>
            unreadCount !== null &&
            unreadCount !== void 0 && (
                <span
                    className={classNames("chat-tab-red-dot", {
                        "is-large": unreadCount > 99,
                    })}
                >
                    {unreadCount < 100 ? unreadCount : "99+"}
                </span>
            ),
        [unreadCount],
    );

    return (
        <span className="chat-tab-title">
            {children}
            {count}
        </span>
    );
};

export default ChatTabTitle;
