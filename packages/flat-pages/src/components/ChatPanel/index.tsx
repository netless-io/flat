import React from "react";
import { observer } from "mobx-react-lite";
import { ChatPanel as ChatPanelImpl, useComputed } from "flat-components";
import { ClassroomStore } from "@netless/flat-stores";
import { generateAvatar } from "../../utils/generate-avatar";

export interface ChatPanelProps {
    classRoomStore: ClassroomStore;
    isShowAllOfStage?: boolean;
    disableMultipleSpeakers?: boolean;
}

// @TODO add rtm
const noop = async (): Promise<void> => void 0;

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel({
    classRoomStore,
    disableMultipleSpeakers,
    isShowAllOfStage,
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
            isShowAllOfStage={isShowAllOfStage}
            loadMoreRows={noop}
            messages={classRoomStore.chatStore.messages}
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
            onAllOffStage={noop}
            onBanChange={classRoomStore.onToggleBan}
            onEndSpeaking={userUUID => {
                void classRoomStore.onStaging(userUUID, false);
            }}
            onMessageSend={classRoomStore.onMessageSend}
        />
    );
});

export default ChatPanel;
