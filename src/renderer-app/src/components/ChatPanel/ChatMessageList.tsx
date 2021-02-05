import { Observer, observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    InfiniteLoader,
    List,
    ListRowRenderer,
    Index,
    IndexRange,
} from "react-virtualized";
import { User } from "../../stores/ClassRoomStore";
import { useReaction } from "../../utils/mobx";
import ChatMessage, { ChatMessageItem } from "./ChatMessage";

export type OnLoadMore = (range: IndexRange) => Promise<void>;

export interface ChatMessageListProps {
    userUUID: string;
    allUsers: Map<string, User>;
    messages: ChatMessageItem[];
    onLoadMore: OnLoadMore;
}

export interface ChatMessageListState {
    lastMessagesCount: number;
    lastLatestMessage?: ChatMessageItem | null;
    scrollToIndex?: number;
    clearScrollToIndex: boolean;
}

export const ChatMessageList = observer<ChatMessageListProps>(function ChatMessageList({
    userUUID,
    allUsers,
    messages,
    onLoadMore,
}) {
    const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(messages.length - 1);

    const [cellCache] = useState(
        () =>
            new CellMeasurerCache({
                defaultHeight: 72,
                fixedWidth: true,
                keyMapper: index => messages[index].uuid,
            }),
    );

    /**
     * The scrollToIndex is causing scroll jumping in random situation.
     * Clear it after it is applied.
     */
    useEffect(() => {
        if (scrollToIndex !== void 0) {
            // wait one loop after rendering complete
            const ticket = window.setTimeout(() => {
                setScrollToIndex(void 0);
            }, 0);
            return () => {
                window.clearTimeout(ticket);
            };
        }
        return;
    }, [scrollToIndex]);

    useReaction(
        () => ({
            messageCount: messages.length,
            latestMessage: messages.length > 0 ? messages[messages.length - 1] : null,
        }),
        ({ messageCount, latestMessage }, prev) => {
            if (messageCount > prev.messageCount) {
                // more messages are loaded
                if (
                    !prev.latestMessage ||
                    latestMessage!.timestamp > prev.latestMessage.timestamp
                ) {
                    // user sent a new message
                    // scroll to the bottom
                    setScrollToIndex(messageCount - 1);
                } else {
                    // history messages loaded
                    // stay at the last position
                    setScrollToIndex(messageCount - prev.messageCount);
                }
            }
        },
    );

    const isFirstLoadRef = useRef(true);

    const isRowLoaded = ({ index }: Index): boolean => {
        // load more when scroll to top
        const loaded = index > 0;
        if (isFirstLoadRef.current) {
            // skip extra first loading
            isFirstLoadRef.current = false;
            return true;
        }
        return loaded;
    };

    const rowRenderer: ListRowRenderer = ({ index, parent, style }) => (
        <CellMeasurer
            cache={cellCache}
            parent={parent}
            key={messages[index].uuid}
            columnIndex={0}
            rowIndex={index}
        >
            {({ measure, registerChild }) => {
                return (
                    <Observer>
                        {() => (
                            // @ts-ignore bug of react-vituralized typing
                            <div ref={registerChild} style={style}>
                                <ChatMessage
                                    onLayoutMount={measure}
                                    userUUID={userUUID}
                                    messageUser={allUsers.get(messages[index].userUUID)}
                                    message={messages[index]}
                                />
                            </div>
                        )}
                    </Observer>
                );
            }}
        </CellMeasurer>
    );

    return (
        <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={onLoadMore}
            rowCount={messages.length}
            threshold={1}
        >
            {({ onRowsRendered, registerChild }) => (
                <AutoSizer>
                    {({ height, width }) => (
                        <Observer>
                            {() => (
                                <List
                                    ref={registerChild}
                                    height={height}
                                    width={width}
                                    rowCount={messages.length}
                                    rowHeight={cellCache.rowHeight}
                                    rowRenderer={rowRenderer}
                                    scrollToIndex={scrollToIndex}
                                    scrollToAlignment="start"
                                    onRowsRendered={onRowsRendered}
                                />
                            )}
                        </Observer>
                    )}
                </AutoSizer>
            )}
        </InfiniteLoader>
    );
});

export default ChatMessageList;
