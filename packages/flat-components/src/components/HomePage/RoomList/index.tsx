import "./style.less";

import React, { PropsWithChildren, ReactElement, useMemo } from "react";
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
}

export function RoomList<T extends string>({
    title,
    filters,
    activeTab,
    onTabActive,
    children,
    style,
}: PropsWithChildren<RoomListProps<T>>): ReactElement {
    const activeTabTitle = useMemo(
        () => filters?.find(tab => tab.key === activeTab)?.title,
        [filters, activeTab],
    );

    return (
        <div className="room-list" style={style}>
            <div className="room-list-header">
                <h1 className="room-list-title">{title}</h1>
                {filters && (
                    <Dropdown
                        overlay={
                            <Menu>
                                {filters.map(({ title, key }) => (
                                    <Menu.Item key={key} onClick={() => onTabActive?.(key)}>
                                        {title}
                                    </Menu.Item>
                                ))}
                            </Menu>
                        }
                    >
                        <span className="room-list-filters">
                            {activeTabTitle} <SVGDown height={24} width={24} />
                        </span>
                    </Dropdown>
                )}
            </div>
            <div className="room-list-body fancy-scrollbar">{children}</div>
        </div>
    );
}
