import React from "react";
import ChatTypeBox from "./ChatTypeBox";
import ChatMessage, { RTMessage } from "./ChatMessage";

export interface ChatMessagesProps {
    userId: string;
    isRoomOwner: boolean;
    messages: RTMessage[];
}

export class ChatMessages extends React.PureComponent<ChatMessagesProps> {
    renderDefault(): React.ReactNode {
        return <div className="chat-messages-default">说点什么吧...</div>;
    }

    render(): React.ReactNode {
        const { isRoomOwner, userId } = this.props;
        const messages: RTMessage[] = [...Array(100)].map((_x, i) => ({
            uuid: "" + i,
            timestamp: Date.now(),
            userId: Math.random() > 0.5 ? userId : "fffff",
            text: String(Date.now()),
        }));

        return (
            <div className="chat-messages-wrap">
                <div className="chat-messages">
                    {messages.length > 0 ? (
                        <div className="chat-messages-box">
                            {messages.map(message => (
                                <ChatMessage key={message.uuid} userId={userId} message={message} />
                            ))}
                        </div>
                    ) : (
                        this.renderDefault()
                    )}
                </div>

                <ChatTypeBox
                    isRoomOwner={isRoomOwner}
                    isBan
                    onBanChange={() => {}}
                    onSend={() => {}}
                />
            </div>
        );
    }
}

export default ChatMessages;
