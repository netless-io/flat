import "./style.less";
import chatMessagesDefaultSVG from "./icons/chat-messages-default.svg";
import chatMessagesDefaultDarkSVG from "./icons/chat-messages-default-dark.svg";

import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { ChatTypeBox, ChatTypeBoxProps } from "../ChatTypeBox";
import { ChatMessageList, ChatMessageListProps } from "../ChatMessageList";
import { DarkModeContext } from "../../FlatThemeProvider";

export type ChatMessagesProps = ChatTypeBoxProps & ChatMessageListProps;

export const ChatMessages = /* @__PURE__ */ observer<ChatMessagesProps>(function ChatMessages({
    messages,
    ...restProps
}) {
    const isDark = useContext(DarkModeContext);

    return (
        <div className="chat-messages-wrap">
            <div className="chat-messages">
                {messages.length > 0 ? (
                    <div className="chat-messages-box">
                        <ChatMessageList messages={messages} {...restProps} />
                    </div>
                ) : (
                    <div className="chat-messages-default">
                        <img src={isDark ? chatMessagesDefaultDarkSVG : chatMessagesDefaultSVG} />
                    </div>
                )}
            </div>
            <ChatTypeBox {...restProps} />
        </div>
    );
});
