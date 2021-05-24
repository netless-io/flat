import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { ChatTypeBox, ChatTypeBoxProps } from "../ChatTypeBox";
import { ChatMessageList, ChatMessageListProps } from "../ChatMessageList";

export type ChatMessagesProps = ChatTypeBoxProps & ChatMessageListProps;

export const ChatMessages = observer<ChatMessagesProps>(function ChatMessages({
    messages,
    ...restProps
}) {
    return (
        <div className="chat-messages-wrap">
            <div className="chat-messages">
                {messages.length > 0 ? (
                    <div className="chat-messages-box">
                        <ChatMessageList messages={messages} {...restProps} />
                    </div>
                ) : (
                    <div className="chat-messages-default">说点什么吧...</div>
                )}
            </div>
            <ChatTypeBox {...restProps} />
        </div>
    );
});
