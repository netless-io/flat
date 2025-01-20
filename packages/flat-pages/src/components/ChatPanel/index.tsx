import React from "react";
import { observer } from "mobx-react-lite";
import { ChatMsg, ChatPanel as ChatPanelImpl } from "flat-components";
import { ClassroomStore } from "@netless/flat-stores";
import { generateAvatar } from "../../utils/generate-avatar";

export interface ChatPanelProps {
    classRoomStore: ClassroomStore;
    messages?: ChatMsg[];
}

// @TODO add rtm
const noop = async (): Promise<void> => void 0;

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel({ classRoomStore, messages }) {
    return (
        <ChatPanelImpl
            generateAvatar={generateAvatar}
            getUserByUUID={(userUUID: string) => classRoomStore.users.cachedUsers.get(userUUID)}
            isBan={classRoomStore.isBan}
            isCreator={classRoomStore.isCreator}
            loadMoreRows={noop}
            messages={messages || classRoomStore.chatStore?.messages || []}
            openCloudStorage={() => classRoomStore.toggleCloudStoragePanel(true)}
            totalUserCount={classRoomStore.users.totalUserCount}
            unreadCount={classRoomStore.users.handRaisingJoiners.length || null}
            userUUID={classRoomStore.userUUID}
            onBanChange={classRoomStore.onToggleBan}
            onClickTotalUsersCount={() => classRoomStore.toggleUsersPanel(true)}
            onMessageSend={classRoomStore.onMessageSend}
        />
    );
});

export default ChatPanel;
