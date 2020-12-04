import React from "react";
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
import ChatMessage, { RTMessage } from "./ChatMessage";

export type OnLoadMore = (range: IndexRange) => Promise<void>;

export interface ChatMessageListProps {
    userId: string;
    messages: RTMessage[];
    onLoadMore: OnLoadMore;
}

export interface ChatMessageListState {
    lastMessagesCount: number;
    lastLatestMessage?: RTMessage | null;
    scrollToIndex?: number;
    resetScrollToIndex: boolean;
}

export class ChatMessageList extends React.PureComponent<
    ChatMessageListProps,
    ChatMessageListState
> {
    state: ChatMessageListState = {
        lastMessagesCount: 0,
        scrollToIndex: -1,
        resetScrollToIndex: false,
    };

    static getDerivedStateFromProps(
        props: ChatMessageListProps,
        state: ChatMessageListState,
    ): Partial<ChatMessageListState> {
        let scrollToIndex = state.scrollToIndex;

        if (state.resetScrollToIndex) {
            scrollToIndex = undefined;
        }

        if (scrollToIndex !== undefined && scrollToIndex < 0) {
            scrollToIndex = props.messages.length - 1;
        } else if (props.messages.length > state.lastMessagesCount) {
            if (
                !state.lastLatestMessage ||
                props.messages[props.messages.length - 1]?.timestamp >
                    state.lastLatestMessage.timestamp
            ) {
                scrollToIndex = props.messages.length - 1;
            } else {
                scrollToIndex = props.messages.length - state.lastMessagesCount;
            }
        }

        return {
            lastMessagesCount: props.messages.length,
            lastLatestMessage: props.messages[props.messages.length - 1],
            scrollToIndex,
            resetScrollToIndex: false,
        };
    }

    componentDidMount() {
        this.resetScrollToIndex();
    }

    componentDidUpdate() {
        this.resetScrollToIndex();
    }

    render(): React.ReactNode {
        const { messages, onLoadMore } = this.props;
        const { scrollToIndex } = this.state;

        return (
            <InfiniteLoader
                isRowLoaded={this.isRowLoaded}
                loadMoreRows={onLoadMore}
                rowCount={messages.length}
                threshold={1}
            >
                {({ onRowsRendered, registerChild }) => (
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                ref={registerChild}
                                height={height}
                                width={width}
                                rowCount={messages.length}
                                rowHeight={this.cellCache.rowHeight}
                                rowRenderer={this.rowRenderer}
                                scrollToIndex={scrollToIndex}
                                scrollToAlignment="start"
                                onRowsRendered={onRowsRendered}
                            />
                        )}
                    </AutoSizer>
                )}
            </InfiniteLoader>
        );
    }

    /**
     * The scrollToIndex is causing scroll jumping.
     * Reset it after it is applied.
     */
    private resetScrollToIndex() {
        if (this.state.scrollToIndex !== undefined) {
            // wait one loop after rendering complete
            setTimeout(() => {
                this.setState({ resetScrollToIndex: true });
            }, 0);
        }
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

    private isFirstLoad = true;

    private isRowLoaded = ({ index }: Index): boolean => {
        // load more when scroll to top
        const loaded = index > 0;
        if (this.isFirstLoad) {
            // skip extra first loading
            this.isFirstLoad = false;
            return true;
        }
        return loaded;
    };
}

export default ChatMessageList;
