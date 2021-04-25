import "./style.less";
import calendarSVG from "./icons/calendar.svg";

import React from "react";
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

type RoomStatusType = "idle" | "running" | "stopped";

interface RoomListItemButton {
    key: string;
    text: string;
}
type RoomListItemButtons = (RoomListItemButton | RoomListItemButton[])[];

export interface RoomListItemProps {
    title: string;
    beginTime?: Date;
    endTime?: Date;
    status: RoomStatusType;
    isPeriodic?: boolean;
    buttons?: RoomListItemButtons;
    onClick?: () => void;
    onClickMenu?: (key: string) => void;
}

const RoomStatusTexts: Record<RoomStatusType, string> = {
    idle: "待开始",
    running: "进行中",
    stopped: "已结束",
};

export const RoomListItem: React.FC<RoomListItemProps> = ({
    title,
    beginTime,
    endTime,
    status,
    isPeriodic,
    buttons,
    onClick,
    onClickMenu,
}) => (
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
        <div className="room-list-item-right">{buttons && renderButtons(buttons, onClickMenu)}</div>
    </div>
);

function renderButtons(
    buttons: RoomListItemButtons,
    onClickMenu?: (key: string) => void,
): React.ReactNode {
    const result: React.ReactNode[] = [];
    for (const buttonConfig of buttons) {
        if (Array.isArray(buttonConfig)) {
            result.push(renderSubMenu(buttonConfig, onClickMenu));
        } else {
            const { key, text } = buttonConfig;
            result.push(
                <Button key={key} type="primary" onClick={() => onClickMenu?.(key)}>
                    {text}
                </Button>,
            );
        }
    }
    return result;
}

function renderSubMenu(
    buttons: RoomListItemButton[],
    onClickMenu?: (key: string) => void,
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
        >
            <Button className="room-list-item-more">...</Button>
        </Dropdown>
    );
}

export interface RoomListProps {
    /** will be hidden on mobile */
    title?: string;
    /** will be title on mobile */
    filters?: {
        title: string;
        key: string;
    }[];
    activeTab?: string;
    onTabActive?: (key: string) => void;
    style?: React.CSSProperties;
    loading?: boolean;
}

export const RoomList: React.FC<RoomListProps> = ({
    title,
    filters,
    activeTab,
    onTabActive,
    children,
    style,
    loading,
}) => {
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
};
