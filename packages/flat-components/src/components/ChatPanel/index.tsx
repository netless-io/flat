import "./style.less";

import React, { useState } from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { ChatMessages, ChatMessagesProps } from "./ChatMessages";
import { ChatTabTitle, ChatTabTitleProps } from "./ChatTabTitle";
import { ChatUsers, ChatUsersProps } from "./ChatUsers";

export type ChatPanelProps = ChatTabTitleProps &
    Omit<ChatMessagesProps, "visible"> &
    ChatUsersProps;

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel(props) {
    const [activeTab, setActiveTab] = useState<"messages" | "users">("messages");

    return (
        <div className="chat-panel">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab as (key: string) => void}
                tabBarGutter={0}
            >
                <Tabs.TabPane tab={<ChatTabTitle>消息列表</ChatTabTitle>} key="messages">
                    <ChatMessages {...props} visible={activeTab === "messages"} />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<ChatTabTitle {...props}>用户列表</ChatTabTitle>} key="users">
                    <ChatUsers {...props} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
});

export { ChatMessage } from "./ChatMessage";

export * from "./types";
