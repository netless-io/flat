import "./style.less";
import { SVGSend, SVGChatBanning } from "../../FlatIcons";

import React, { useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSafePromise } from "../../../utils/hooks";
import { useTranslate } from "@netless/flat-i18n";

export interface ChatTypeBoxProps {
    /** Only room owner can ban chatting. */
    isCreator: boolean;
    isBan: boolean;
    onBanChange: () => void;
    onMessageSend?: (text: string) => Promise<void>;
}

export const ChatTypeBox = /* @__PURE__ */ observer<ChatTypeBoxProps>(function ChatTypeBox({
    isCreator,
    isBan,
    onBanChange,
    onMessageSend,
}) {
    const t = useTranslate();
    const sp = useSafePromise();
    const inputRef = useRef<HTMLInputElement>(null);
    const [text, updateText] = useState("");
    const [isSending, updateSending] = useState(false);

    const trimmedText = useMemo(() => text.trim(), [text]);

    async function sendMessage(): Promise<void> {
        if (isSending || trimmedText.length <= 0) {
            return;
        }
        if (!onMessageSend) {
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
                    <SVGChatBanning active={isBan} />
                </button>
            )}
            {!isCreator && isBan ? (
                <span className="chat-typebox-ban-input" title={t("all-staff-are-under-ban")}>
                    {t("all-staff-are-under-ban")}
                </span>
            ) : (
                <input
                    ref={inputRef}
                    className="chat-typebox-input"
                    placeholder={t("say-something")}
                    type="text"
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
                disabled={(!isCreator && isBan) || isSending || trimmedText.length <= 0}
                title={t("send")}
                onClick={sendMessage}
            >
                <SVGSend />
            </button>
        </div>
    );
});
