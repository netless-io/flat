import React from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { ChatMessages } from "./ChatMessages";
import { ChatUsers } from "./ChatUsers";
import { ChatTabTitle } from "./ChatTabTitle";
import { ClassRoomStore } from "../../stores/ClassRoomStore";

import "./ChatPanel.less";

export interface ChatPanelProps {
    classRoomStore: ClassRoomStore;
    disableMultipleSpeakers?: boolean;
    disableHandRaising?: boolean;
}

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel({
    classRoomStore,
    disableMultipleSpeakers,
    disableHandRaising,
}) {
    return (
        <div className="chat-panel">
            <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                <Tabs.TabPane tab={<ChatTabTitle>消息列表</ChatTabTitle>} key="messages">
                    <ChatMessages
                        classRoomStore={classRoomStore}
                        disableHandRaising={disableHandRaising}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane
                    tab={
                        <ChatTabTitle
                            unreadCount={classRoomStore.users.handRaisingJoiners.length || null}
                        >
                            用户列表
                        </ChatTabTitle>
                    }
                    key="users"
                >
                    <ChatUsers
                        classRoomStore={classRoomStore}
                        disableMultipleSpeakers={disableMultipleSpeakers}
                    />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
});

export default ChatPanel;
