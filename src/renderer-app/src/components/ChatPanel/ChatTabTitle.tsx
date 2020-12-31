import React from "react";
import classNames from "classnames";
import "./ChatTabTitle.less";

export interface ChatTabTitleProps {
    unreadCount?: number | null;
}

export class ChatTabTitle extends React.PureComponent<ChatTabTitleProps> {
    render(): React.ReactNode {
        const { unreadCount, children } = this.props;

        return (
            <span className="chat-tab-title">
                {children}
                {unreadCount !== null && unreadCount !== undefined && (
                    <span
                        className={classNames("chat-tab-red-dot", {
                            "is-large": unreadCount > 99,
                        })}
                    >
                        {unreadCount < 100 ? unreadCount : "99+"}
                    </span>
                )}
            </span>
        );
    }
}

export default ChatTabTitle;
