import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { ChatMessages, ChatMessagesProps } from "./ChatMessages";
import { ChatTabTitle, ChatTabTitleProps } from "./ChatTabTitle";

export type ChatPanelProps = {
    totalUserCount?: number;
    onClickTotalUsersCount?: () => void;
    readOnly?: boolean;
    cc?: React.ReactNode;
} & ChatTabTitleProps &
    Omit<ChatMessagesProps, "visible">;

export const ChatPanel = /* @__PURE__ */ observer<ChatPanelProps>(function ChatPanel(props) {
    const t = useTranslate();

    return (
        <div className="chat-panel">
            {!props.readOnly && (
                <div className="chat-panel-header">
                    <ChatTabTitle>
                        <span>{t("messages")}</span>
                    </ChatTabTitle>
                    {props.totalUserCount && (
                        <span className="chat-tab-subtitle" onClick={props.onClickTotalUsersCount}>
                            {t("total-users-count", { count: props.totalUserCount })}
                        </span>
                    )}
                </div>
            )}
            <ChatMessages {...props} visible readOnly={props.readOnly} />
            {props.cc && <div className="chat-panel-cc">{props.cc}</div>}
        </div>
    );
});

export { ChatMessage } from "./ChatMessage";

export * from "./types";
