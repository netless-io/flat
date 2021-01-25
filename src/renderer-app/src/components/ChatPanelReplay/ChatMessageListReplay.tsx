import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    List,
    ListRowRenderer,
} from "react-virtualized";
import ChatMessage, { ChatMessageItem } from "../ChatPanel/ChatMessage";

export interface ChatMessageListReplayProps {
    userUUID: string;
    messages: ChatMessageItem[];
}

export const ChatMessageListReplay = observer<ChatMessageListReplayProps>(
    function ChatMessageListReplay({ userUUID, messages }) {
        const [cellCache] = useState(
            () =>
                new CellMeasurerCache({
                    defaultHeight: 72,
                    fixedWidth: true,
                    keyMapper: index => messages[index].uuid,
                }),
        );

        const rowRenderer: ListRowRenderer = ({ index, parent, style }) => {
            return (
                <CellMeasurer
                    cache={cellCache}
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
                                    onLayoutMount={measure}
                                    userUUID={userUUID}
                                    message={messages[index]}
                                />
                            </div>
                        );
                    }}
                </CellMeasurer>
            );
        };

        return (
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        height={height}
                        width={width}
                        rowCount={messages.length}
                        rowHeight={cellCache.rowHeight}
                        rowRenderer={rowRenderer}
                        scrollToIndex={messages.length - 1}
                        scrollToAlignment="start"
                    />
                )}
            </AutoSizer>
        );
    },
);

export default ChatMessageListReplay;
