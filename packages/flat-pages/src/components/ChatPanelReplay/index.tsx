import React from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { ChatMessagesReplay } from "./ChatMessagesReplay";
import type { ClassroomReplayStore } from "@netless/flat-stores";
import { useTranslation } from "react-i18next";

export interface ChatPanelReplayProps {
    classRoomReplayStore: ClassroomReplayStore;
}

export const ChatPanelReplay = observer<ChatPanelReplayProps>(function ChatPanelReplay({
    classRoomReplayStore,
}) {
    const { t } = useTranslation();
    return (
        <div className="chat-panel">
            <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                <Tabs.TabPane key="messages" tab={t("messages")}>
                    <ChatMessagesReplay classRoomReplayStore={classRoomReplayStore} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
});

export default ChatPanelReplay;
