import "./style.less";

import React, { PropsWithChildren, ReactElement, useCallback, useMemo, useRef } from "react";
import { Dropdown, Menu } from "antd";
import { SVGDown } from "../../FlatIcons";

export * from "./RoomListItem";
export * from "./RoomListEmpty";
export * from "./RoomListSkeletons";
export * from "./RoomListAllLoaded";

export interface RoomListProps<T extends string> {
    /** will be hidden on mobile */
    title?: string;
    /** will be title on mobile */
    filters?: Array<{
        title: string;
        key: T;
    }>;
    activeTab?: T;
    onTabActive?: (key: T) => void;
    style?: React.CSSProperties;
    onScrollToBottom?: () => void;
}

export function RoomList<T extends string>({
    title,
    filters,
    activeTab,
    onTabActive,
    children,
    style,
    onScrollToBottom,
}: PropsWithChildren<RoomListProps<T>>): ReactElement {
    const activeTabTitle = useMemo(
        () => filters?.find(tab => tab.key === activeTab)?.title,
        [filters, activeTab],
    );

    const isAtTheBottomRef = useRef(false);
    const roomListContainerRef = useRef<HTMLDivElement>(null);

    const onScroll = useCallback((): void => {
        if (roomListContainerRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = roomListContainerRef.current;
            const threshold = scrollHeight - 30;
            const isAtTheBottom = scrollTop + clientHeight >= threshold;
            if (isAtTheBottomRef.current !== isAtTheBottom) {
                isAtTheBottomRef.current = isAtTheBottom;
                if (isAtTheBottom && onScrollToBottom) {
                    onScrollToBottom();
                }
            }
        }
    }, [onScrollToBottom]);

    return (
        <div className="room-list" style={style}>
            <div className="room-list-header">
                <h1 className="room-list-title">{title}</h1>
                {filters && (
                    <Dropdown
                        overlay={
                            <Menu
                                items={filters.map(({ title, key }) => ({
                                    key,
                                    onClick: () => onTabActive?.(key),
                                    label: title,
                                }))}
                            />
                        }
                    >
                        <span className="room-list-filters">
                            {activeTabTitle} <SVGDown height={24} width={24} />
                        </span>
                    </Dropdown>
                )}
            </div>
            <div
                ref={roomListContainerRef}
                className="room-list-body fancy-scrollbar"
                onScroll={onScroll}
            >
                {children}
            </div>
        </div>
    );
}
