import React from "react";
import { observer } from "mobx-react-lite";
import { ChatTypeBox, ChatTypeBoxProps } from "./ChatTypeBox";
import { ChatMessageItem } from "./ChatMessage";
import { ChatMessageList, OnLoadMore } from "./ChatMessageList";
import "./ChatMessages.less";

export interface ChatMessagesProps extends ChatTypeBoxProps {
    userUUID: string;
    messages: ChatMessageItem[];
    isBan: boolean;
    onMessageSend: (text: string) => Promise<void>;
    onLoadMore: OnLoadMore;
    onBanChange: () => void;
}

export const ChatMessages = observer<ChatMessagesProps>(function ChatMessages({
    userUUID,
    messages,
    onLoadMore,
    ...restProps
}) {
    return (
        <div className="chat-messages-wrap">
            <div className="chat-messages">
                {messages.length > 0 ? (
                    <div className="chat-messages-box">
                        <ChatMessageList
                            userUUID={userUUID}
                            messages={messages}
                            onLoadMore={onLoadMore}
                        />
                    </div>
                ) : (
                    <div className="chat-messages-default">说点什么吧...</div>
                )}
            </div>
            <ChatTypeBox {...restProps} />
        </div>
    );
});

export default ChatMessages;
