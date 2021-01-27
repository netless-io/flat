import React from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { ChatMessageItem } from "../ChatPanel/ChatMessage";
import { ChatMessagesReplay } from "./ChatMessagesReplay";

import "../ChatPanel/ChatPanel.less";

export interface ChatPanelReplayProps {
    userUUID: string;
    messages: ChatMessageItem[];
}

export const ChatPanelReplay = observer<ChatPanelReplayProps>(function ChatPanelReplay({
    userUUID,
    messages,
}) {
    return (
        <div className="chat-panel">
            <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                <Tabs.TabPane tab="消息列表" key="messages">
                    <ChatMessagesReplay userUUID={userUUID} messages={messages} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
});

export default ChatPanelReplay;
