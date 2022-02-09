import React from "react";
import { observer } from "mobx-react-lite";
import { ChatPanel as ChatPanelImpl, useComputed } from "flat-components";
import { ClassRoomStore } from "../../stores/class-room-store";
import { generateAvatar } from "../../utils/generate-avatar";

export interface ChatPanelProps {
    classRoomStore: ClassRoomStore;
    disableMultipleSpeakers?: boolean;
}

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel({
    classRoomStore,
    disableMultipleSpeakers,
}) {
    const users = useComputed(() => {
        const { creator, speakingJoiners, handRaisingJoiners, otherJoiners } = classRoomStore.users;
        return creator
            ? [...speakingJoiners, ...handRaisingJoiners, creator, ...otherJoiners]
            : [...speakingJoiners, ...handRaisingJoiners, ...otherJoiners];
    }).get();

    return (
        <ChatPanelImpl
            generateAvatar={generateAvatar}
            getUserByUUID={(userUUID: string) => classRoomStore.users.cachedUsers.get(userUUID)}
            hasHandRaising={classRoomStore.users.handRaisingJoiners.length > 0}
            hasSpeaking={classRoomStore.users.speakingJoiners.length > 0}
            isBan={classRoomStore.isBan}
            isCreator={classRoomStore.isCreator}
            loadMoreRows={classRoomStore.updateHistory}
            messages={classRoomStore.messages}
            openCloudStorage={() => classRoomStore.toggleCloudStoragePanel(true)}
            ownerUUID={classRoomStore.ownerUUID}
            unreadCount={classRoomStore.users.handRaisingJoiners.length || null}
            userUUID={classRoomStore.userUUID}
            users={users}
            onAcceptRaiseHand={(userUUID: string) => {
                if (classRoomStore.users.speakingJoiners.length > 0 && disableMultipleSpeakers) {
                    // only one speaker is allowed
                    return;
                }
                classRoomStore.acceptRaiseHand(userUUID);
            }}
            onBanChange={classRoomStore.onToggleBan}
            onCancelAllHandRaising={classRoomStore.onCancelAllHandRaising}
            onEndSpeaking={userUUID => {
                void classRoomStore.onSpeak([{ userUUID, speak: false }]);
            }}
            onMessageSend={classRoomStore.onMessageSend}
        />
    );
});

export default ChatPanel;
