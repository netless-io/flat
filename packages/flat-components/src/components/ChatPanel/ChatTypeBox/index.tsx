import "./style.less";
import sendSVG from "./icons/send.svg";
import banChatSVG from "./icons/ban-chat.svg";
import banChatActiveSVG from "./icons/ban-chat-active.svg";

import React, { useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSafePromise } from "../../../utils/hooks";
import { useTranslation } from "react-i18next";

export interface ChatTypeBoxProps {
    /** Only room owner can ban chatting. */
    isCreator: boolean;
    isBan: boolean;
    onBanChange: () => void;
    onMessageSend: (text: string) => Promise<void>;
}

export const ChatTypeBox = observer<ChatTypeBoxProps>(function ChatTypeBox({
    isCreator,
    isBan,
    onBanChange,
    onMessageSend,
}) {
    const { t } = useTranslation();
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
            {isCreator && (
                <button className="chat-typebox-icon" title={t("ban")} onClick={onBanChange}>
                    <img src={isBan ? banChatActiveSVG : banChatSVG} />
                </button>
            )}
            {!isCreator && isBan ? (
                <span className="chat-typebox-ban-input" title={t("all-staff-are-under-ban")}>
                    {t("all-staff-are-under-ban")}
                </span>
            ) : (
                <input
                    className="chat-typebox-input"
                    type="text"
                    placeholder={t("say-something")}
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
                title={t("send")}
                onClick={sendMessage}
                disabled={isBan || isSending || trimmedText.length <= 0}
            >
                <img src={sendSVG} />
            </button>
        </div>
    );
});
