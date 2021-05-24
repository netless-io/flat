import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { ChatTypeBox, ChatTypeBoxProps } from "../ChatTypeBox";
import { ChatMessageList, ChatMessageListProps } from "../ChatMessageList";
import { useTranslation } from "react-i18next";

export type ChatMessagesProps = ChatTypeBoxProps & ChatMessageListProps;

export const ChatMessages = observer<ChatMessagesProps>(function ChatMessages({
    messages,
    ...restProps
}) {
    const { t } = useTranslation();
    return (
        <div className="chat-messages-wrap">
            <div className="chat-messages">
                {messages.length > 0 ? (
                    <div className="chat-messages-box">
                        <ChatMessageList messages={messages} {...restProps} />
                    </div>
                ) : (
                    <div className="chat-messages-default">{t("say-something")}</div>
                )}
            </div>
            <ChatTypeBox {...restProps} />
        </div>
    );
});
