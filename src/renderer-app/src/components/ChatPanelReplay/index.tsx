import * as React from "react";
import { Tabs } from "antd";
import { Player } from "white-web-sdk";
import { Rtm } from "../../apiMiddleware/Rtm";
import { RTMessage } from "../ChatPanel/ChatMessage";
import { ChatMessagesReplay } from "./ChatMessagesReplay";

import "../ChatPanel/ChatPanel.less";

export interface ChatPanelReplayProps {
    userId: string;
    channelId: string;
    player: Player;
}

export interface ChatPanelReplayState {
    messages: RTMessage[];
    renderedMessages: RTMessage[];
}

export class ChatPanelReplay extends React.Component<ChatPanelReplayProps, ChatPanelReplayState> {
    private rtm = new Rtm();
    private isLoadingHistory = false;
    private remoteOldestTimestamp = Infinity;
    private currentPlayTime = -1;

    state: ChatPanelReplayState = {
        messages: [],
        renderedMessages: [],
    };

    async componentDidMount() {
        const { userId, channelId, player } = this.props;
        await this.rtm.init(userId, channelId);
        player.callbacks.on("onProgressTimeChanged", this.playerOnProgressTimeChanged);
    }

    componentWillUnmount() {
        this.rtm.destroy();
        this.props.player.callbacks.off("onProgressTimeChanged", this.playerOnProgressTimeChanged);
    }

    render() {
        return (
            <div className="chat-panel">
                <Tabs defaultActiveKey="messages" tabBarGutter={0}>
                    <Tabs.TabPane tab="消息列表" key="messages">
                        <ChatMessagesReplay
                            userId={this.props.userId}
                            messages={this.state.renderedMessages}
                        />
                    </Tabs.TabPane>
                </Tabs>
            </div>
        );
    }

    private playerOnProgressTimeChanged = (offset: number): void => {
        // always keep the latest current time
        this.currentPlayTime = this.props.player.beginTimestamp + offset;
        const { messages, renderedMessages } = this.state;
        this.syncMessages(messages, renderedMessages);
    };

    private syncMessages = async (
        messages: RTMessage[],
        renderedMessages: RTMessage[],
    ): Promise<void> => {
        if (this.isLoadingHistory) {
            return;
        }

        if (messages.length <= 0) {
            const newMessages = await this.getHistory(this.currentPlayTime - 1);
            if (newMessages) {
                return this.syncMessages(newMessages, renderedMessages);
            }
            return;
        }

        if (this.currentPlayTime < messages[0].timestamp) {
            // user seeked backward
            // start over
            return this.syncMessages([], []);
        }

        if (this.currentPlayTime < renderedMessages[renderedMessages.length - 1]?.timestamp) {
            // user seeked backward but still within total loaded messages range.
            // reset rendered messages
            return this.syncMessages(messages, []);
        }

        let start = renderedMessages.length;
        while (start < messages.length && this.currentPlayTime >= messages[start].timestamp) {
            start += 1;
        }
        if (start === renderedMessages.length) {
            // no new messages
            return;
        }
        if (start >= messages.length) {
            // more messages need to be loaded
            const newMessages = await this.getHistory(messages[0].timestamp);
            if (newMessages) {
                return this.syncMessages([...messages, ...newMessages], renderedMessages);
            }
        }
        this.setState({ messages, renderedMessages: messages.slice(0, start) });
    };

    private getHistory = async (oldestTimestap: number): Promise<RTMessage[] | null> => {
        if (oldestTimestap >= this.remoteOldestTimestamp) {
            return null;
        }

        this.isLoadingHistory = true;
        try {
            const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
            const messages = await this.rtm.fetchHistory(
                oldestTimestap + 1,
                oldestTimestap + ONE_YEAR,
            );
            this.isLoadingHistory = false;
            if (messages.length <= 0) {
                this.remoteOldestTimestamp = oldestTimestap;
            }
            return messages;
        } catch (e) {
            this.isLoadingHistory = false;
            console.warn(e);
            return null;
        }
    };
}

export default ChatPanelReplay;
