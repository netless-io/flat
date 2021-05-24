import React from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { ChatMessagesReplay } from "./ChatMessagesReplay";
import { ClassRoomReplayStore } from "../../stores/ClassRoomReplayStore";

export interface ChatPanelReplayProps {
    classRoomReplayStore: ClassRoomReplayStore;
}

export const ChatPanelReplay = observer<ChatPanelReplayProps>(function ChatPanelReplay({
    classRoomReplayStore,
}) {
    return (
        <div className="chat-panel">
            <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                <Tabs.TabPane tab="消息列表" key="messages">
                    <ChatMessagesReplay classRoomReplayStore={classRoomReplayStore} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
});

export default ChatPanelReplay;
