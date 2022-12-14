import React from "react";
import { observer } from "mobx-react-lite";
import { ChatPanel as ChatPanelImpl } from "flat-components";
import { ClassroomStore } from "@netless/flat-stores";

export interface ChatPanelProps {
    classRoomStore: ClassroomStore;
}

// @TODO add rtm
const noop = async (): Promise<void> => void 0;

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel({ classRoomStore }) {
    return (
        <ChatPanelImpl
            getUserByUUID={(userUUID: string) => classRoomStore.users.cachedUsers.get(userUUID)}
            isBan={classRoomStore.isBan}
            isCreator={classRoomStore.isCreator}
            loadMoreRows={noop}
            messages={classRoomStore.chatStore.messages}
            openCloudStorage={() => classRoomStore.toggleCloudStoragePanel(true)}
            unreadCount={classRoomStore.users.handRaisingJoiners.length || null}
            userUUID={classRoomStore.userUUID}
            onBanChange={classRoomStore.onToggleBan}
            onMessageSend={classRoomStore.onMessageSend}
        />
    );
});

export default ChatPanel;
