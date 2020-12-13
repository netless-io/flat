import React from "react";
import { Identity } from "../../utils/localStorage/room";
import send from "../../assets/image/send.svg";
import banChat from "../../assets/image/ban-chat.svg";
import banChatActive from "../../assets/image/ban-chat-active.svg";
import hand from "../../assets/image/hand.svg";
import handActive from "../../assets/image/hand-active.svg";

export interface ChatTypeBoxProps {
    /** Only room owner can ban chatting. */
    identity: Identity;
    isBan: boolean;
    isRaiseHand?: boolean;
    onBanChange: () => void;
    onSend: (text: string) => Promise<void>;
    onRaiseHandChange?: () => void;
}

export interface ChatTypeBoxState {
    text: string;
    isSending: boolean;
}

export class ChatTypeBox extends React.PureComponent<ChatTypeBoxProps, ChatTypeBoxState> {
    state: ChatTypeBoxState = {
        text: "",
        isSending: false,
    };

    updateText = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ text: e.currentTarget.value.slice(0, 200) });
    };

    send = async (): Promise<void> => {
        const text = this.state.text.trim();
        if (!text) {
            return;
        }
        this.setState({ isSending: true });
        await this.props.onSend(text);
        this.setState({ text: "", isSending: false });
    };

    onInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            this.send();
        }
    };

    render(): React.ReactNode {
        const { identity, isBan, isRaiseHand, onBanChange, onRaiseHandChange } = this.props;
        const { text, isSending } = this.state;

        return (
            <div className="chat-typebox">
                {identity === Identity.creator ? (
                    <button className="chat-typebox-icon" title="禁言" onClick={onBanChange}>
                        <img src={isBan ? banChatActive : banChat} />
                    </button>
                ) : (
                    <button className="chat-typebox-icon" title="举手" onClick={onRaiseHandChange}>
                        <img src={isRaiseHand ? handActive : hand} />
                    </button>
                )}
                {isBan ? (
                    <span className="chat-typebox-ban-input" title="全员禁言中">
                        全员禁言中
                    </span>
                ) : (
                    <input
                        className="chat-typebox-input"
                        type="text"
                        placeholder="说点什么…"
                        value={text}
                        onChange={this.updateText}
                        onKeyPress={this.onInputKeyPress}
                    />
                )}
                <button
                    className="chat-typebox-send"
                    title="发送"
                    onClick={this.send}
                    disabled={isBan || isSending || text.length <= 0}
                >
                    <img src={send} />
                </button>
            </div>
        );
    }
}

export default ChatTypeBox;
