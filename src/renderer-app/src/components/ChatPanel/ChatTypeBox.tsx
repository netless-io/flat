import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { User } from "./ChatUser";

import send from "../../assets/image/send.svg";
import banChat from "../../assets/image/ban-chat.svg";
import banChatActive from "../../assets/image/ban-chat-active.svg";
import hand from "../../assets/image/hand.svg";
import handActive from "../../assets/image/hand-active.svg";

export interface ChatTypeBoxProps {
    /** Only room owner can ban chatting. */
    isCreator: boolean;
    isBan: boolean;
    currentUser?: User | null;
    onBanChange: () => void;
    onMessageSend: (text: string) => Promise<void>;
    onRaiseHandChange: () => void;
}

export interface ChatTypeBoxState {
    text: string;
    isSending: boolean;
}

export const ChatTypeBox = observer<ChatTypeBoxProps>(function ChatTypeBox({
    isCreator,
    isBan,
    currentUser,
    onBanChange,
    onMessageSend,
    onRaiseHandChange,
}) {
    const [text, updateText] = useState("");
    const [isSending, updateSending] = useState(false);

    const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        updateText(e.currentTarget.value.slice(0, 200));
    }, []);

    const onInputKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            updateSending(true);
        }
    }, []);

    const onSendBtnPressed = useCallback(() => {
        updateSending(true);
    }, []);

    useEffect(() => {
        if (!isSending || !text) {
            return;
        }

        let isUmount = false;

        onMessageSend(text)
            .catch(error => {
                console.warn(error);
            })
            .then(() => {
                if (!isUmount) {
                    updateText("");
                    updateSending(false);
                }
            });

        return () => {
            isUmount = true;
        };
    }, [isSending, text, onMessageSend]);

    return (
        <div className="chat-typebox">
            {isCreator ? (
                <button className="chat-typebox-icon" title="禁言" onClick={onBanChange}>
                    <img src={isBan ? banChatActive : banChat} />
                </button>
            ) : (
                <button className="chat-typebox-icon" title="举手" onClick={onRaiseHandChange}>
                    <img src={currentUser?.isRaiseHand ? handActive : hand} />
                </button>
            )}
            {!isCreator && isBan ? (
                <span className="chat-typebox-ban-input" title="全员禁言中">
                    全员禁言中
                </span>
            ) : (
                <input
                    className="chat-typebox-input"
                    type="text"
                    placeholder="说点什么…"
                    value={text}
                    onChange={onInputChange}
                    onKeyPress={onInputKeyPress}
                />
            )}
            <button
                className="chat-typebox-send"
                title="发送"
                onClick={onSendBtnPressed}
                disabled={isBan || isSending || text.length <= 0}
            >
                <img src={send} />
            </button>
        </div>
    );
});

export default ChatTypeBox;
