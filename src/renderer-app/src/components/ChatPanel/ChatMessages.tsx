import "./ChatMessages.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { ClassRoomStore } from "../../stores/ClassRoomStore";
import { ChatTypeBox } from "./ChatTypeBox";
import { ChatMessageList } from "./ChatMessageList";

export interface ChatMessagesProps {
    visible: boolean;
    classRoomStore: ClassRoomStore;
    disableHandRaising?: boolean;
}

export const ChatMessages = observer<ChatMessagesProps>(function ChatMessages({
    visible,
    classRoomStore,
    disableHandRaising,
}) {
    return (
        <div className="chat-messages-wrap">
            <div className="chat-messages">
                {classRoomStore.messages.length > 0 ? (
                    <div className="chat-messages-box">
                        <ChatMessageList visible={visible} classRoomStore={classRoomStore} />
                    </div>
                ) : (
                    <div className="chat-messages-default">说点什么吧...</div>
                )}
            </div>
            <ChatTypeBox
                isCreator={classRoomStore.isCreator}
                isBan={classRoomStore.isBan}
                currentUser={classRoomStore.users.currentUser}
                disableHandRaising={disableHandRaising || !classRoomStore.users.creator}
                onBanChange={classRoomStore.onToggleBan}
                onMessageSend={classRoomStore.onMessageSend}
                onRaiseHandChange={classRoomStore.onToggleHandRaising}
            />
        </div>
    );
});

export default ChatMessages;
