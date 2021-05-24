import "./style.less";
import sendSVG from "./icons/send.svg";
import banChatSVG from "./icons/ban-chat.svg";
import banChatActiveSVG from "./icons/ban-chat-active.svg";
import handSVG from "./icons/hand.svg";
import handActiveSVG from "./icons/hand-active.svg";

import React, { useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSafePromise } from "../../../utils/hooks";

export interface ChatTypeBoxProps {
    /** Only room owner can ban chatting. */
    isCreator: boolean;
    isBan: boolean;
    isRaiseHand?: boolean;
    disableHandRaising?: boolean;
    onBanChange: () => void;
    onMessageSend: (text: string) => Promise<void>;
    onRaiseHandChange: () => void;
}

export const ChatTypeBox = observer<ChatTypeBoxProps>(function ChatTypeBox({
    isCreator,
    isBan,
    isRaiseHand,
    disableHandRaising,
    onBanChange,
    onMessageSend,
    onRaiseHandChange,
}) {
    const sp = useSafePromise();
    const inputRef = useRef<HTMLInputElement>(null);
    const [text, updateText] = useState("");
    const [isSending, updateSending] = useState(false);

    const trimmedText = useMemo(() => text.trim(), [text]);

    async function sendMessage(): Promise<void> {
        if (isSending || trimmedText.length <= 0) {
            return;
        }

        updateSending(true);

        try {
            await sp(onMessageSend(text));
            updateText("");
            inputRef.current?.focus();
        } catch (e) {
            console.warn(e);
        }

        updateSending(false);
    }

    return (
        <div className="chat-typebox">
            {isCreator ? (
                <button className="chat-typebox-icon" title="禁言" onClick={onBanChange}>
                    <img src={isBan ? banChatActiveSVG : banChatSVG} />
                </button>
            ) : (
                !disableHandRaising && (
                    <button className="chat-typebox-icon" title="举手" onClick={onRaiseHandChange}>
                        <img src={isRaiseHand ? handActiveSVG : handSVG} />
                    </button>
                )
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
                    ref={inputRef}
                    value={text}
                    onChange={e => updateText(e.currentTarget.value.slice(0, 200))}
                    onKeyPress={e => {
                        if (e.key === "Enter") {
                            void sendMessage();
                        }
                    }}
                />
            )}
            <button
                className="chat-typebox-send"
                title="发送"
                onClick={sendMessage}
                disabled={isBan || isSending || trimmedText.length <= 0}
            >
                <img src={sendSVG} />
            </button>
        </div>
    );
});
