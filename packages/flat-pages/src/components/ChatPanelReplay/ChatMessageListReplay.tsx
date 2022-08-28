import React, { useState } from "react";
import { Observer, observer } from "mobx-react-lite";
import { ChatMessage } from "flat-components";
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    List,
    ListRowRenderer,
} from "react-virtualized";
import type { ClassroomReplayStore } from "@netless/flat-stores";

export interface ChatMessageListReplayProps {
    classRoomReplayStore: ClassroomReplayStore;
}

export const ChatMessageListReplay = observer<ChatMessageListReplayProps>(
    function ChatMessageListReplay({ classRoomReplayStore }) {
        const [cellCache] = useState(
            () =>
                new CellMeasurerCache({
                    defaultHeight: 72,
                    fixedWidth: true,
                    keyMapper: index => classRoomReplayStore.messages[index].uuid,
                }),
        );

        const rowRenderer: ListRowRenderer = ({ index, parent, style }) => {
            return (
                <CellMeasurer
                    key={classRoomReplayStore.messages[index].uuid}
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
                                            message={classRoomReplayStore.messages[index]}
                                            messageUser={classRoomReplayStore.users.cachedUsers.get(
                                                classRoomReplayStore.messages[index].senderID,
                                            )}
                                            userUUID={classRoomReplayStore.userUUID}
                                            onMount={measure}
                                        />
                                    )}
                                </Observer>
                            </div>
                        );
                    }}
                </CellMeasurer>
            );
        };

        return (
            <AutoSizer>
                {({ height, width }) => (
                    <Observer>
                        {() => (
                            <List
                                className="fancy-scrollbar"
                                height={height}
                                rowCount={classRoomReplayStore.messages.length}
                                rowHeight={cellCache.rowHeight}
                                rowRenderer={rowRenderer}
                                scrollToAlignment="start"
                                scrollToIndex={classRoomReplayStore.messages.length - 1}
                                width={width}
                            />
                        )}
                    </Observer>
                )}
            </AutoSizer>
        );
    },
);

export default ChatMessageListReplay;
