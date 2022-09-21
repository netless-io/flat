import React from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { ChatMessagesReplay } from "./ChatMessagesReplay";
import type { ClassroomReplayStore } from "@netless/flat-stores";
import { useTranslate } from "@netless/flat-i18n";

export interface ChatPanelReplayProps {
    classRoomReplayStore: ClassroomReplayStore;
}

export const ChatPanelReplay = observer<ChatPanelReplayProps>(function ChatPanelReplay({
    classRoomReplayStore,
}) {
    const t = useTranslate();
    return (
        <div className="chat-panel">
            <Tabs
                defaultActiveKey="messages"
                items={[
                    {
                        key: "messages",
                        label: t("messages"),
                        children: (
                            <ChatMessagesReplay classRoomReplayStore={classRoomReplayStore} />
                        ),
                    },
                ]}
                tabBarGutter={0}
            ></Tabs>
        </div>
    );
});

export default ChatPanelReplay;
