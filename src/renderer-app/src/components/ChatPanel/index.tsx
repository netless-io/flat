import React, { useCallback } from "react";
import { Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { ChatMessages } from "./ChatMessages";
import { ChatUsers } from "./ChatUsers";
import { ChatTabTitle } from "./ChatTabTitle";
import { ClassRoomStore } from "../../stores/ClassRoomStore";

import "./ChatPanel.less";

export interface ChatPanelProps {
    classRoomStore: ClassRoomStore;
    allowMultipleSpeakers: boolean;
}

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel({
    classRoomStore,
    allowMultipleSpeakers,
}) {
    const onAcceptRaiseHand = useCallback(
        (userUUID: string): void => {
            if (classRoomStore.speakingJoiners.length > 0 && !allowMultipleSpeakers) {
                // only one speaker is allowed
                return;
            }
            classRoomStore.acceptRaiseHand(userUUID);
        },
        // exhaustive-deps is not compatible with mobx
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            classRoomStore.speakingJoiners.length,
            classRoomStore.acceptRaiseHand,
            allowMultipleSpeakers,
        ],
    );

    const onEndSpeaking = useCallback(
        (userUUID: string): void => {
            classRoomStore.onSpeak([{ userUUID, speak: false }]);
        },
        // exhaustive-deps is not compatible with mobx
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [classRoomStore.onSpeak],
    );

    return (
        <div className="chat-panel">
            <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                <Tabs.TabPane tab={<ChatTabTitle>消息列表</ChatTabTitle>} key="messages">
                    <ChatMessages
                        isCreator={classRoomStore.isCreator}
                        userUUID={classRoomStore.userUUID}
                        messages={classRoomStore.messages}
                        currentUser={classRoomStore.currentUser}
                        isBan={classRoomStore.isBan}
                        onMessageSend={classRoomStore.onMessageSend}
                        onLoadMore={classRoomStore.updateHistory}
                        onRaiseHandChange={classRoomStore.onToggleHandRaising}
                        onBanChange={classRoomStore.onToggleBan}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane
                    tab={
                        <ChatTabTitle
                            unreadCount={classRoomStore.handRaisingJoiners.length || null}
                        >
                            用户列表
                        </ChatTabTitle>
                    }
                    key="users"
                >
                    <ChatUsers
                        isCreator={classRoomStore.isCreator}
                        ownerUUID={classRoomStore.ownerUUID}
                        userUUID={classRoomStore.userUUID}
                        speakingJoiners={classRoomStore.speakingJoiners}
                        handRaisingJoiners={classRoomStore.handRaisingJoiners}
                        creator={classRoomStore.creator}
                        otherJoiners={classRoomStore.otherJoiners}
                        onAcceptRaiseHand={onAcceptRaiseHand}
                        onEndSpeaking={onEndSpeaking}
                        onCancelAllHandRaising={classRoomStore.onCancelAllHandRaising}
                    />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
});

export default ChatPanel;
