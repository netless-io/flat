import React from "react";
import { observer } from "mobx-react-lite";
import { ChatMessageItem } from "../ChatPanel/ChatMessage";
import { ChatMessageListReplay } from "./ChatMessageListReplay";
import "../ChatPanel/ChatMessages.less";

export interface ChatMessagesReplayProps {
    userUUID: string;
    messages: ChatMessageItem[];
}

export const ChatMessagesReplay = observer<ChatMessagesReplayProps>(function ChatMessagesReplay({
    userUUID,
    messages,
}) {
    return (
        <div className="chat-messages-wrap">
            <div className="chat-messages">
                {messages.length > 0 ? (
                    <div className="chat-messages-box">
                        {<ChatMessageListReplay userUUID={userUUID} messages={messages} />}
                    </div>
                ) : (
                    <div className="chat-messages-default">无消息...</div>
                )}
            </div>
        </div>
    );
});

export default ChatMessagesReplay;
