import React from "react";
import { observer } from "mobx-react-lite";
import { ChatPanel as ChatPanelImpl, useComputed } from "flat-components";
import { ClassRoomStore } from "../../stores/class-room-store";
import { generateAvatar } from "../../utils/generate-avatar";

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
    const users = useComputed(() => {
        const { creator, speakingJoiners, handRaisingJoiners, otherJoiners } = classRoomStore.users;
        return creator
            ? [...speakingJoiners, ...handRaisingJoiners, creator, ...otherJoiners]
            : [...speakingJoiners, ...handRaisingJoiners, ...otherJoiners];
    }).get();

    return (
        <ChatPanelImpl
            isCreator={classRoomStore.isCreator}
            isBan={classRoomStore.isBan}
            onBanChange={classRoomStore.onToggleBan}
            onMessageSend={classRoomStore.onMessageSend}
            onRaiseHandChange={classRoomStore.onToggleHandRaising}
            userUUID={classRoomStore.userUUID}
            messages={classRoomStore.messages}
            getUserByUUID={(userUUID: string) => classRoomStore.users.cachedUsers.get(userUUID)}
            loadMoreRows={classRoomStore.updateHistory}
            hasHandRaising={classRoomStore.users.handRaisingJoiners.length > 0}
            hasSpeaking={classRoomStore.users.speakingJoiners.length > 0}
            users={users}
            onCancelAllHandRaising={classRoomStore.onCancelAllHandRaising}
            ownerUUID={classRoomStore.ownerUUID}
            onAcceptRaiseHand={(userUUID: string) => {
                if (classRoomStore.users.speakingJoiners.length > 0 && disableMultipleSpeakers) {
                    // only one speaker is allowed
                    return;
                }
                classRoomStore.acceptRaiseHand(userUUID);
            }}
            onEndSpeaking={userUUID => {
                void classRoomStore.onSpeak([{ userUUID, speak: false }]);
            }}
            generateAvatar={generateAvatar}
            disableHandRaising={disableHandRaising}
            isRaiseHand={classRoomStore.users.currentUser?.isRaiseHand}
            unreadCount={classRoomStore.users.handRaisingJoiners.length || null}
        />
    );
});

export default ChatPanel;
