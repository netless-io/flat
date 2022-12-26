import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { ChatMessages, ChatMessagesProps } from "./ChatMessages";
import { ChatTabTitle, ChatTabTitleProps } from "./ChatTabTitle";

export type ChatPanelProps = ChatTabTitleProps & Omit<ChatMessagesProps, "visible">;

export const ChatPanel = /* @__PURE__ */ observer<ChatPanelProps>(function ChatPanel(props) {
    const t = useTranslate();

    return (
        <div className="chat-panel">
            <div className="chat-panel-header">
                <ChatTabTitle>
                    <span>{t("messages")}</span>
                </ChatTabTitle>
            </div>
            <ChatMessages {...props} visible />
        </div>
    );
});

export { ChatMessage } from "./ChatMessage";

export * from "./types";
