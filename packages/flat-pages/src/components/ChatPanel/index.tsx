import React from "react";
import { observer } from "mobx-react-lite";
import { ChatPanel as ChatPanelImpl, useComputed } from "flat-components";
import { ClassroomStore, User } from "@netless/flat-stores";
import { uniqBy } from "lodash-es";
import { generateAvatar } from "../../utils/generate-avatar";

export interface ChatPanelProps {
    classRoomStore: ClassroomStore;
    disableEndSpeaking?: boolean;
    maxSpeakingUsers?: number;
}

// @TODO add rtm
const noop = async (): Promise<void> => void 0;

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel({
    classRoomStore,
    disableEndSpeaking,
    maxSpeakingUsers = 1,
}) {
    const users = useComputed(() => {
        const onStageUsers = classRoomStore.onStageUserUUIDs
            .map(userUUID => classRoomStore.users.cachedUsers.get(userUUID))
            .filter((user): user is User => !!user);
        const { creator, handRaisingJoiners, otherJoiners } = classRoomStore.users;
        const users = creator
            ? [...onStageUsers, ...handRaisingJoiners, creator, ...otherJoiners]
            : [...onStageUsers, ...handRaisingJoiners, ...otherJoiners];
        return uniqBy(users, user => user.userUUID);
    }).get();

    const handHandRaising = classRoomStore.users.handRaisingJoiners.length > 0;

    return (
        <ChatPanelImpl
            disableEndSpeaking={disableEndSpeaking}
            generateAvatar={generateAvatar}
            getUserByUUID={(userUUID: string) => classRoomStore.users.cachedUsers.get(userUUID)}
            hasHandRaising={handHandRaising}
            isBan={classRoomStore.isBan}
            isCreator={classRoomStore.isCreator}
            loadMoreRows={noop}
            messages={classRoomStore.chatStore.messages}
            openCloudStorage={() => classRoomStore.toggleCloudStoragePanel(true)}
            ownerUUID={classRoomStore.ownerUUID}
            unreadCount={classRoomStore.users.handRaisingJoiners.length || null}
            userUUID={classRoomStore.userUUID}
            users={users}
            withAcceptHands={
                handHandRaising && classRoomStore.onStageUserUUIDs.length < maxSpeakingUsers
            }
            onAcceptRaiseHand={(userUUID: string) => {
                if (classRoomStore.onStageUserUUIDs.length < maxSpeakingUsers) {
                    classRoomStore.acceptRaiseHand(userUUID);
                }
            }}
            onBanChange={classRoomStore.onToggleBan}
            onCancelAllHandRaising={classRoomStore.onCancelAllHandRaising}
            onEndSpeaking={userUUID => {
                void classRoomStore.onStaging(userUUID, false);
            }}
            onMessageSend={classRoomStore.onMessageSend}
        />
    );
});

export default ChatPanel;
