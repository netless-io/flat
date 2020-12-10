import React from "react";
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    List,
    ListRowRenderer,
} from "react-virtualized";
import ChatMessage, { RTMessage } from "../ChatPanel/ChatMessage";

export interface ChatMessageListReplayProps {
    userId: string;
    messages: RTMessage[];
}

export class ChatMessageListReplay extends React.PureComponent<ChatMessageListReplayProps> {
    render(): React.ReactNode {
        const { messages } = this.props;

        return (
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        height={height}
                        width={width}
                        rowCount={messages.length}
                        rowHeight={this.cellCache.rowHeight}
                        rowRenderer={this.rowRenderer}
                        scrollToIndex={messages.length - 1}
                        scrollToAlignment="start"
                    />
                )}
            </AutoSizer>
        );
    }

    private cellCache = new CellMeasurerCache({
        defaultHeight: 72,
        fixedWidth: true,
        keyMapper: index => this.props.messages[index].uuid,
    });

    private rowRenderer: ListRowRenderer = ({ index, parent, style }) => {
        const { messages, userId } = this.props;
        return (
            <CellMeasurer
                cache={this.cellCache}
                parent={parent}
                key={messages[index].uuid}
                columnIndex={0}
                rowIndex={index}
            >
                {({ measure, registerChild }) => {
                    return (
                        // @ts-ignore bug of react-vituralized typing
                        <div ref={registerChild} style={style}>
                            <ChatMessage
                                onLoaded={measure}
                                userId={userId}
                                message={messages[index]}
                            />
                        </div>
                    );
                }}
            </CellMeasurer>
        );
    };
}

export default ChatMessageListReplay;
