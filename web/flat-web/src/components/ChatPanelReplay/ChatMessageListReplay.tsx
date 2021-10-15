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
import { ClassRoomReplayStore } from "../../stores/class-room-replay-store";

export interface ChatMessageListReplayProps {
    classRoomReplayStore: ClassRoomReplayStore;
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
                    cache={cellCache}
                    parent={parent}
                    key={classRoomReplayStore.messages[index].uuid}
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
                                            userUUID={classRoomReplayStore.userUUID}
                                            messageUser={classRoomReplayStore.users.cachedUsers.get(
                                                classRoomReplayStore.messages[index].userUUID,
                                            )}
                                            message={classRoomReplayStore.messages[index]}
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
                                width={width}
                                rowCount={classRoomReplayStore.messages.length}
                                rowHeight={cellCache.rowHeight}
                                rowRenderer={rowRenderer}
                                scrollToIndex={classRoomReplayStore.messages.length - 1}
                                scrollToAlignment="start"
                            />
                        )}
                    </Observer>
                )}
            </AutoSizer>
        );
    },
);

export default ChatMessageListReplay;
