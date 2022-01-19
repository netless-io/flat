import React, { useState } from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { ChatMessages, ChatMessagesProps } from "./ChatMessages";
import { ChatTabTitle, ChatTabTitleProps } from "./ChatTabTitle";
import { ChatUsers, ChatUsersProps } from "./ChatUsers";
import "./style.less";

export type ChatPanelProps = ChatTabTitleProps &
    Omit<ChatMessagesProps, "visible"> &
    ChatUsersProps;

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel(props) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<"messages" | "users">("messages");

    return (
        <div className="chat-panel">
            <Tabs
                activeKey={activeTab}
                tabBarGutter={0}
                onChange={setActiveTab as (key: string) => void}
            >
                <Tabs.TabPane key="messages" tab={<ChatTabTitle>{t("messages")}</ChatTabTitle>}>
                    <ChatMessages {...props} visible={activeTab === "messages"} />
                </Tabs.TabPane>
                <Tabs.TabPane
                    key="users"
                    tab={<ChatTabTitle {...props}>{t("users")}</ChatTabTitle>}
                >
                    <ChatUsers {...props} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
});

export { ChatMessage } from "./ChatMessage";

export * from "./types";
