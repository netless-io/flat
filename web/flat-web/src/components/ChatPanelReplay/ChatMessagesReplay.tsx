import React from "react";
import { observer } from "mobx-react-lite";
import { ChatMessageListReplay } from "./ChatMessageListReplay";
import { ClassRoomReplayStore } from "../../stores/ClassRoomReplayStore";

export interface ChatMessagesReplayProps {
    classRoomReplayStore: ClassRoomReplayStore;
}

export const ChatMessagesReplay = observer<ChatMessagesReplayProps>(function ChatMessagesReplay({
    classRoomReplayStore,
}) {
    return (
        <div className="chat-messages-wrap">
            <div className="chat-messages">
                {classRoomReplayStore.messages.length > 0 ? (
                    <div className="chat-messages-box">
                        {<ChatMessageListReplay classRoomReplayStore={classRoomReplayStore} />}
                    </div>
                ) : (
                    <div className="chat-messages-default">无消息...</div>
                )}
            </div>
        </div>
    );
});

export default ChatMessagesReplay;
