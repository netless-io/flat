import React, { useState } from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { ChatMessages } from "./ChatMessages";
import { ChatUsers } from "./ChatUsers";
import { ChatTabTitle } from "./ChatTabTitle";
import { ClassRoomStore } from "../../stores/ClassRoomStore";

import "./ChatPanel.less";

enum RTMTab {
    Messages = "Messages",
    Users = "Users",
}

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
    const [activeTab, setActiveTab] = useState(RTMTab.Messages);
    return (
        <div className="chat-panel">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab as (key: string) => void}
                tabBarGutter={0}
            >
                <Tabs.TabPane tab={<ChatTabTitle>消息列表</ChatTabTitle>} key={RTMTab.Messages}>
                    <ChatMessages
                        visible={activeTab === RTMTab.Messages}
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
                    key={RTMTab.Users}
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
