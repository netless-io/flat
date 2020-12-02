import * as React from "react";
import { Tabs } from "antd";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { Rtm } from "../../apiMiddleware/Rtm";
import "./ChatPanel.less";
import ChatMessages from "./ChatMessages";
import { RTMessage } from "./ChatMessage";

export interface ChatPanelProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    userId: string;
    channelId: string;
    isRoomOwner: boolean;
}

export interface ChatPanelState {
    messages: RTMessage[];
}

export class ChatPanel extends React.Component<ChatPanelProps, ChatPanelState> {
    private rtm = new Rtm();

    state: ChatPanelState = {
        messages: [],
    };

    async componentDidMount() {
        const { userId, channelId } = this.props;
        const channel = await this.rtm.init(userId, channelId);
        channel.on("ChannelMessage", (msg, senderId) => {
            if (msg.messageType === "TEXT") {
                this.setState(state => ({
                    messages: [
                        ...state.messages,
                        {
                            uuid: uuidv4(),
                            timestamp: Date.now(),
                            text: msg.text,
                            userId: senderId,
                        },
                    ],
                }));
            }
        });
    }

    componentWillUnmount() {
        this.rtm.destroy();
    }

    render() {
        const { isRoomOwner, userId, channelId, className, ...restProps } = this.props;
        const { messages } = this.state;
        return (
            <div {...restProps} className={classNames("chat-panel", className)}>
                <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                    <Tabs.TabPane tab="消息列表" key="messages">
                        <ChatMessages
                            userId={userId}
                            isRoomOwner={isRoomOwner}
                            messages={messages}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="用户列表" key="users">
                        Content of Tab Pane 2
                    </Tabs.TabPane>
                </Tabs>
            </div>
        );
    }
}

export default ChatPanel;
