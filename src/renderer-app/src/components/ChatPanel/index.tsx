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
    disableMultipleSpeakers?: boolean;
    disableHandRaising?: boolean;
}

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel({
    classRoomStore,
    disableMultipleSpeakers,
    disableHandRaising,
}) {
    const onAcceptRaiseHand = useCallback(
        (userUUID: string): void => {
            if (classRoomStore.users.speakingJoiners.length > 0 && disableMultipleSpeakers) {
                // only one speaker is allowed
                return;
            }
            classRoomStore.acceptRaiseHand(userUUID);
        },
        // exhaustive-deps is not compatible with mobx
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            classRoomStore.users.speakingJoiners.length,
            classRoomStore.acceptRaiseHand,
            disableMultipleSpeakers,
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
                        allUsers={classRoomStore.users.cachedUsers}
                        messages={classRoomStore.messages}
                        currentUser={classRoomStore.users.currentUser}
                        isBan={classRoomStore.isBan}
                        disableHandRaising={disableHandRaising || !classRoomStore.users.creator}
                        onMessageSend={classRoomStore.onMessageSend}
                        onLoadMore={classRoomStore.updateHistory}
                        onRaiseHandChange={classRoomStore.onToggleHandRaising}
                        onBanChange={classRoomStore.onToggleBan}
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
                        isCreator={classRoomStore.isCreator}
                        ownerUUID={classRoomStore.ownerUUID}
                        userUUID={classRoomStore.userUUID}
                        speakingJoiners={classRoomStore.users.speakingJoiners}
                        handRaisingJoiners={classRoomStore.users.handRaisingJoiners}
                        creator={classRoomStore.users.creator}
                        otherJoiners={classRoomStore.users.otherJoiners}
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
