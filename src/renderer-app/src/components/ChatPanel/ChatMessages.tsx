import "./ChatMessages.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { User } from "../../stores/ClassRoomStore";
import { ChatTypeBox, ChatTypeBoxProps } from "./ChatTypeBox";
import { ChatMessageItem } from "./ChatMessage";
import { ChatMessageList, OnLoadMore } from "./ChatMessageList";

export interface ChatMessagesProps extends ChatTypeBoxProps {
    userUUID: string;
    allUsers: Map<string, User>;
    messages: ChatMessageItem[];
    isBan: boolean;
    onMessageSend: (text: string) => Promise<void>;
    onLoadMore: OnLoadMore;
    onBanChange: () => void;
}

export const ChatMessages = observer<ChatMessagesProps>(function ChatMessages({
    userUUID,
    allUsers,
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
                            allUsers={allUsers}
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
