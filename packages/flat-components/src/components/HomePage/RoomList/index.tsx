import "./style.less";
import calendarSVG from "./icons/calendar.svg";

import React, { PropsWithChildren, ReactElement } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { zhCN } from "date-fns/locale";
import classNames from "classnames";
import { Button, Dropdown, Menu } from "antd";

export interface RoomListDateProps {
    date: Date;
}

export const RoomListDate: React.FC<RoomListDateProps> = ({ date }) => (
    <div className="room-list-date">
        <img src={calendarSVG} alt="" />
        <time dateTime={date.toUTCString()}>
            {format(date, "MMM do", { locale: zhCN })}
            {" · "}
            {isToday(date)
                ? "今天"
                : isTomorrow(date)
                ? "明天"
                : format(date, "E", { locale: zhCN })}
        </time>
    </div>
);

export type RoomStatusType = "idle" | "running" | "stopped";

export interface RoomListItemButton<T extends string> {
    key: T;
    text: string;
    disabled?: boolean;
}
export type RoomListItemButtons<T extends string> = (
    | RoomListItemButton<T>
    | RoomListItemButton<T>[]
)[];

export interface RoomListItemProps<T extends string> {
    title: string;
    beginTime?: Date;
    endTime?: Date;
    status: RoomStatusType;
    isPeriodic?: boolean;
    buttons?: RoomListItemButtons<T>;
    onClick?: () => void;
    onClickMenu?: (key: T) => void;
}

const RoomStatusTexts: Record<RoomStatusType, string> = {
    idle: "待开始",
    running: "进行中",
    stopped: "已结束",
};

export function RoomListItem<T extends string = string>({
    title,
    beginTime,
    endTime,
    status,
    isPeriodic,
    buttons,
    onClick,
    onClickMenu,
}: PropsWithChildren<RoomListItemProps<T>>): ReactElement {
    return (
        <div className="room-list-item">
            <div
                className={classNames("room-list-item-left", { pointer: !!onClick })}
                onClick={onClick}
            >
                <div className="room-list-item-title">{title}</div>
                <div className="room-list-item-info">
                    {(beginTime || endTime) && (
                        <div className="room-list-item-duration">
                            {beginTime && format(beginTime, "HH:mm")}
                            {" ~ "}
                            {endTime && format(endTime, "HH:mm")}
                        </div>
                    )}
                    <div className="room-list-item-status">
                        <span className={status}>{RoomStatusTexts[status]}</span>
                        {isPeriodic && <span className="periodic">周期</span>}
                    </div>
                </div>
            </div>
            <div className="room-list-item-right">
                {buttons && renderButtons(buttons, onClickMenu)}
            </div>
        </div>
    );
}

function renderButtons<T extends string>(
    buttons: RoomListItemButtons<T>,
    onClickMenu?: (key: T) => void,
): React.ReactNode {
    const result: React.ReactNode[] = [];
    for (const buttonConfig of buttons) {
        if (Array.isArray(buttonConfig)) {
            result.push(renderSubMenu(buttonConfig, "room-list-item-sub-menu", onClickMenu));
        } else {
            const { key, text, disabled } = buttonConfig;
            result.push(
                <Button
                    key={key}
                    type="primary"
                    onClick={() => onClickMenu?.(key)}
                    disabled={disabled}
                >
                    {text}
                </Button>,
            );
        }
    }
    return result;
}

function renderSubMenu<T extends string>(
    buttons: RoomListItemButton<T>[],
    overlayClassName?: string,
    onClickMenu?: (key: T) => void,
): React.ReactNode {
    return (
        <Dropdown
            key={Math.random()}
            overlay={
                <Menu>
                    {buttons.map(button => (
                        <Menu.Item key={button.key} onClick={() => onClickMenu?.(button.key)}>
                            {button.text}
                        </Menu.Item>
                    ))}
                </Menu>
            }
            trigger={["click"]}
            overlayClassName={overlayClassName}
        >
            <Button className="room-list-item-more">...</Button>
        </Dropdown>
    );
}

export interface RoomListProps<T extends string> {
    /** will be hidden on mobile */
    title?: string;
    /** will be title on mobile */
    filters?: {
        title: string;
        key: T;
    }[];
    activeTab?: T;
    onTabActive?: (key: T) => void;
    style?: React.CSSProperties;
    loading?: boolean;
}

export function RoomList<T extends string>({
    title,
    filters,
    activeTab,
    onTabActive,
    children,
    style,
    loading,
}: PropsWithChildren<RoomListProps<T>>): ReactElement {
    return (
        <div className="room-list" style={style}>
            <div className="room-list-header">
                <div className="room-list-title">{title}</div>
                <div className="room-list-filters">
                    {filters?.map(({ title, key }) => (
                        <span
                            key={key}
                            className={classNames("tab", {
                                active: activeTab === key,
                                pointer: activeTab !== key,
                            })}
                            onClick={() => onTabActive?.(key)}
                        >
                            {title}
                        </span>
                    ))}
                </div>
            </div>
            <div className="room-list-body fancy-scrollbar">
                {children}
                {!loading && <div className="room-list-footer">已加载全部</div>}
            </div>
        </div>
    );
}
