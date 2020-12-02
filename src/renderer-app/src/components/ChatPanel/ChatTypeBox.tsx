import React from "react";
import send from "../../assets/image/send.svg";
import banChat from "../../assets/image/ban-chat.svg";
import banChatActive from "../../assets/image/ban-chat-active.svg";

export interface ChatTypeBoxProps {
    /** Only room owner can ban chatting. */
    isRoomOwner: boolean;
    isBan: boolean;
    onBanChange: (isBan: boolean) => void;
    onSend: (text: string) => void;
}

export interface ChatTypeBoxState {
    text: string;
}

export class ChatTypeBox extends React.PureComponent<ChatTypeBoxProps, ChatTypeBoxState> {
    state: ChatTypeBoxState = {
        text: "",
    };

    updateText = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ text: e.currentTarget.value });
    };

    send = (): void => {
        this.props.onSend(this.state.text);
        this.setState({ text: "" });
    };

    toggleBan = (): void => {
        this.props.onBanChange(!this.props.isBan);
    };

    onInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            this.send();
        }
    };

    render(): React.ReactNode {
        const { isRoomOwner, isBan } = this.props;
        const { text } = this.state;

        return (
            <div className="chat-typebox">
                {isRoomOwner && (
                    <button className="chat-typebox-ban" title="禁言" onClick={this.toggleBan}>
                        <img src={isBan ? banChatActive : banChat} />
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
                        onChange={this.updateText}
                        onKeyPress={this.onInputKeyPress}
                    />
                )}
                <button
                    className="chat-typebox-send"
                    title="发送"
                    onClick={this.send}
                    disabled={isBan || text.length <= 0}
                >
                    <img src={send} />
                </button>
            </div>
        );
    }
}

export default ChatTypeBox;
