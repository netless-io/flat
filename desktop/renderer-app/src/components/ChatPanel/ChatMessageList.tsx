import { Observer, observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { useUpdate } from "react-use";
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
import { ClassRoomStore } from "../../stores/ClassRoomStore";
import { useReaction } from "../../utils/mobx";
import ChatMessage from "./ChatMessage";

export type OnLoadMore = (range: IndexRange) => Promise<void>;

export interface ChatMessageListProps {
    visible: boolean;
    classRoomStore: ClassRoomStore;
}

export const ChatMessageList = observer<ChatMessageListProps>(function ChatMessageList({
    visible,
    classRoomStore,
}) {
    const forceUpdate = useUpdate();

    const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(
        classRoomStore.messages.length - 1,
    );

    const [cellCache] = useState(
        () =>
            new CellMeasurerCache({
                defaultHeight: 72,
                fixedWidth: true,
                keyMapper: index => classRoomStore.messages[index].uuid,
            }),
    );

    useEffect(() => {
        // re-measure cell when tab panel is visible
        if (visible) {
            cellCache.clearAll();
            forceUpdate();
            setScrollToIndex(classRoomStore.messages.length - 1);
        }
        // only listen to visible
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

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
            messageCount: classRoomStore.messages.length,
            latestMessage:
                classRoomStore.messages.length > 0
                    ? classRoomStore.messages[classRoomStore.messages.length - 1]
                    : null,
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
            key={classRoomStore.messages[index].uuid}
            columnIndex={0}
            rowIndex={index}
        >
            {({ measure, registerChild }) => {
                return (
                    <div ref={el => el && registerChild && registerChild(el)} style={style}>
                        <Observer>
                            {() => (
                                <ChatMessage
                                    onMount={measure}
                                    userUUID={classRoomStore.userUUID}
                                    messageUser={classRoomStore.users.cachedUsers.get(
                                        classRoomStore.messages[index].userUUID,
                                    )}
                                    message={classRoomStore.messages[index]}
                                />
                            )}
                        </Observer>
                    </div>
                );
            }}
        </CellMeasurer>
    );

    return (
        <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={classRoomStore.updateHistory}
            rowCount={classRoomStore.messages.length}
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
                                    rowCount={classRoomStore.messages.length}
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
