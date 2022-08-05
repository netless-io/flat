import React from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { ChatMessagesReplay } from "./ChatMessagesReplay";
import { ClassRoomReplayStore } from "../../stores/class-room-replay-store";
import { useTranslate } from "@netless/flat-i18n";

export interface ChatPanelReplayProps {
    classRoomReplayStore: ClassRoomReplayStore;
}

export const ChatPanelReplay = observer<ChatPanelReplayProps>(function ChatPanelReplay({
    classRoomReplayStore,
}) {
    const t = useTranslate();
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
