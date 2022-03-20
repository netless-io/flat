import "./style.less";

import React, { useState } from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { SVGChat, SVGUserGroup } from "../FlatIcons";
import { ChatMessages, ChatMessagesProps } from "./ChatMessages";
import { ChatTabTitle, ChatTabTitleProps } from "./ChatTabTitle";
import { ChatUsers, ChatUsersProps } from "./ChatUsers";

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
                <Tabs.TabPane
                    key="messages"
                    tab={
                        <ChatTabTitle>
                            <SVGChat />
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
                            <SVGUserGroup />
                            <span>{t("users")}</span>
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
