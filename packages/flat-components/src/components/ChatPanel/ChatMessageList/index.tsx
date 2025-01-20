import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUpdate } from "react-use";
import { Observer, observer } from "mobx-react-lite";
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    Index,
    InfiniteLoader,
    InfiniteLoaderProps,
    List,
    ListRowRenderer,
} from "react-virtualized";
import { User } from "../../../types/user";
import { useReaction } from "../../../utils/hooks";
import { ChatMessage } from "../ChatMessage";
import { ChatMsg } from "../types";

export interface ChatMessageListProps {
    visible: boolean;
    userUUID: string;
    messages: ChatMsg[];
    getUserByUUID: (uuid: string) => User | undefined;
    generateAvatar: (uid: string) => string;
    loadMoreRows: InfiniteLoaderProps["loadMoreRows"];
    openCloudStorage: () => void;
}

export const ChatMessageList = /* @__PURE__ */ observer<ChatMessageListProps>(
    function ChatMessageList({
        visible,
        userUUID,
        messages,
        getUserByUUID,
        generateAvatar,
        loadMoreRows,
        openCloudStorage,
    }) {
        const forceUpdate = useUpdate();

        const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(messages.length - 1);

        const [cellCache] = useState(
            () =>
                new CellMeasurerCache({
                    defaultHeight: 72,
                    fixedWidth: true,
                    keyMapper: index => messages[index].uuid,
                }),
        );

        useEffect(() => {
            // re-measure cell when tab panel is visible
            if (visible) {
                cellCache.clearAll();
                forceUpdate();
                setScrollToIndex(messages.length - 1);
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
                        // scroll to the bottom only if the user is the last message's sender or is at bottom
                        if (latestMessage?.senderID === userUUID) {
                            setScrollToIndex(messageCount - 1);
                        } else {
                            const div = document.querySelector(".chat-message-list");
                            if (div && div.scrollTop + div.clientHeight >= div.scrollHeight - 30) {
                                setScrollToIndex(messageCount - 1);
                            }
                        }
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
                key={messages[index].uuid}
                cache={cellCache}
                columnIndex={0}
                parent={parent}
                rowIndex={index}
            >
                {({ measure, registerChild }) => {
                    return (
                        <div ref={el => el && registerChild && registerChild(el)} style={style}>
                            <Observer>
                                {() => (
                                    <ChatMessage
                                        generateAvatar={generateAvatar}
                                        message={messages[index]}
                                        messageUser={getUserByUUID(messages[index].senderID)}
                                        openCloudStorage={openCloudStorage}
                                        userUUID={userUUID}
                                        onMount={measure}
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
                loadMoreRows={loadMoreRows}
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
                                        className="chat-message-list fancy-scrollbar"
                                        height={height}
                                        rowCount={messages.length}
                                        rowHeight={cellCache.rowHeight}
                                        rowRenderer={rowRenderer}
                                        scrollToAlignment="start"
                                        scrollToIndex={scrollToIndex}
                                        width={width}
                                        onRowsRendered={onRowsRendered}
                                    />
                                )}
                            </Observer>
                        )}
                    </AutoSizer>
                )}
            </InfiniteLoader>
        );
    },
);

export const ReadOnlyChatMessageList = /* @__PURE__ */ observer<ChatMessageListProps>(
    function ReadOnlyChatMessageList({ userUUID, messages, getUserByUUID, generateAvatar }) {
        const showMessages = useMemo(() => {
            return messages
                .reduce((preValue, curValue, curIndex: number) => {
                    if (curIndex === 0) {
                        preValue.unshift(curValue);
                    } else if (preValue[0].timestamp < curValue.timestamp) {
                        preValue.unshift(curValue);
                    }
                    return preValue;
                }, [] as ChatMsg[])
                .slice(0, 2);
        }, [messages]);
        return (
            <div className="chat-message-list">
                {showMessages.map(message => (
                    <ChatMessage
                        key={message.uuid}
                        generateAvatar={generateAvatar}
                        message={message}
                        messageUser={getUserByUUID(message.senderID)}
                        userUUID={userUUID}
                        onMount={() => void 0}
                    />
                ))}
            </div>
        );
    },
);
