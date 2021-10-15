import React from "react";
import { observer } from "mobx-react-lite";
import { ChatMessageListReplay } from "./ChatMessageListReplay";
import { ClassRoomReplayStore } from "../../stores/class-room-replay-store";
import { useTranslation } from "react-i18next";

export interface ChatMessagesReplayProps {
    classRoomReplayStore: ClassRoomReplayStore;
}

export const ChatMessagesReplay = observer<ChatMessagesReplayProps>(function ChatMessagesReplay({
    classRoomReplayStore,
}) {
    const { t } = useTranslation();
    return (
        <div className="chat-messages-wrap">
            <div className="chat-messages">
                {classRoomReplayStore.messages.length > 0 ? (
                    <div className="chat-messages-box">
                        {<ChatMessageListReplay classRoomReplayStore={classRoomReplayStore} />}
                    </div>
                ) : (
                    <div className="chat-messages-default">{t("no-message-tips")}</div>
                )}
            </div>
        </div>
    );
});

export default ChatMessagesReplay;
