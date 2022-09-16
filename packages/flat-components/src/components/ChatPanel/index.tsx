import "./style.less";

import React, { useMemo, useState } from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { ChatMessages, ChatMessagesProps } from "./ChatMessages";
import { ChatTabTitle, ChatTabTitleProps } from "./ChatTabTitle";
import { ChatUsers, ChatUsersProps } from "./ChatUsers";

export type ChatPanelProps = ChatTabTitleProps &
    Omit<ChatMessagesProps, "visible"> &
    ChatUsersProps;

export const ChatPanel = /* @__PURE__ */ observer<ChatPanelProps>(function ChatPanel(props) {
    const t = useTranslate();
    const [activeTab, setActiveTab] = useState<"messages" | "users">("messages");
    const usersCount = useMemo(() => {
        const count = props.users.length;
        if (count === 0) {
            return "";
        }
        if (count > 999) {
            return "(999+)";
        }
        return `(${count})`;
    }, [props.users.length]);

    return (
        <div className="chat-panel">
            <Tabs
                activeKey={activeTab}
                tabBarGutter={0}
                onChange={setActiveTab as (key: string) => void}
            >
                <Tabs.TabPane
                    key="messages"
                    tab={
                        <ChatTabTitle>
                            <span>{t("messages")}</span>
                        </ChatTabTitle>
                    }
                >
                    <ChatMessages {...props} visible={activeTab === "messages"} />
                </Tabs.TabPane>
                <Tabs.TabPane
                    key="users"
                    tab={
                        <ChatTabTitle {...props}>
                            <span>
                                {t("users")} {usersCount}
                            </span>
                        </ChatTabTitle>
                    }
                >
                    <ChatUsers {...props} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
});

export { ChatMessage } from "./ChatMessage";

export * from "./types";
