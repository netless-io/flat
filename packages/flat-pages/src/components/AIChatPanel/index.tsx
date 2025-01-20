import React from "react";
import { observer } from "mobx-react-lite";
import { ChatPanel as ChatPanelImpl } from "flat-components";
import { ClassroomStore } from "@netless/flat-stores";
import { generateAvatar } from "../../utils/generate-avatar";
import { User } from "flat-components/src/types/user";

export interface ChatPanelProps {
    classRoomStore: ClassroomStore;
    aiUser: User;
    uuid?: string;
    cc?: React.ReactNode;
    show?: boolean;
}

// @TODO add rtm
const noop = async (): Promise<void> => void 0;

export const AIChatPanel = observer<ChatPanelProps>(function ChatPanel({
    classRoomStore,
    aiUser,
    uuid,
    cc,
    show = true,
}) {
    return (
        <ChatPanelImpl
            cc={cc}
            generateAvatar={generateAvatar}
            getUserByUUID={(userUUID: string) => {
                if (userUUID === aiUser.userUUID) {
                    return aiUser;
                }
                if (userUUID === classRoomStore.rtcUID) {
                    return classRoomStore.users.cachedUsers.get(classRoomStore.userUUID);
                }
                return undefined;
            }}
            isBan={classRoomStore.isBan}
            isCreator={classRoomStore.isCreator}
            loadMoreRows={noop}
            messages={
                (show
                    ? uuid
                        ? classRoomStore.aiChatStore?.messages.filter(m => m.senderID === uuid)
                        : classRoomStore.aiChatStore?.messages
                    : []) || []
            }
            openCloudStorage={() => classRoomStore.toggleCloudStoragePanel(true)}
            readOnly={!!uuid}
            unreadCount={classRoomStore.users.handRaisingJoiners.length || null}
            userUUID={classRoomStore.userUUID}
            onBanChange={classRoomStore.onToggleBan}
        />
    );
});

export default AIChatPanel;
