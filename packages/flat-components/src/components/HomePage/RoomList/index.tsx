import "./style.less";
import calendarSVG from "./icons/calendar.svg";
import emptyHistorySVG from "./icons/empty-history.svg";
import emptyRoomSVG from "./icons/empty-room.svg";

import React, { PropsWithChildren, ReactElement } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import classNames from "classnames";
import { Button, Dropdown, Menu, Skeleton } from "antd";
import { useTranslation } from "react-i18next";

export interface RoomListDateProps {
    date: Date;
}

export const RoomListDate: React.FC<RoomListDateProps> = ({ date }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    return (
        <div className="room-list-date">
            <img src={calendarSVG} alt="" />
            <time dateTime={date.toUTCString()}>
                {format(date, "MMM do", {
                    locale: lang?.startsWith("zh") ? zhCN : enUS,
                })}
                {" · "}
                {isToday(date)
                    ? t("today")
                    : isTomorrow(date)
                    ? t("tomorrow")
                    : format(date, "E", {
                          locale: lang?.startsWith("zh") ? zhCN : enUS,
                      })}
            </time>
        </div>
    );
};

export type RoomStatusType = "upcoming" | "running" | "paused" | "stopped";

export interface RoomListItemButton<T extends string> {
    key: T;
    text: string;
    disabled?: boolean;
}
export type RoomListItemButtons<T extends string> = Array<
    RoomListItemButton<T> | Array<RoomListItemButton<T>>
>;

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
    const { t } = useTranslation();
    return (
        <div className="room-list-item">
            <div
                className={classNames("room-list-item-left", {
                    pointer: !!onClick,
                })}
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
                        <span className={status}>{t(`room-status.${status}`)}</span>
                        {isPeriodic && <span className="periodic">{t("periodic")}</span>}
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
    buttons: Array<RoomListItemButton<T>>,
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

export function RoomListAlreadyLoaded(): ReactElement {
    const { t } = useTranslation();

    return <div className="room-list-footer">{t("loaded-all")}</div>;
}

export interface RoomListEmptyProps {
    isHistory: boolean;
}

export function RoomListEmpty({ isHistory }: RoomListEmptyProps): ReactElement {
    const { t } = useTranslation();
    return (
        <div className="room-empty-box">
            <img src={isHistory ? emptyHistorySVG : emptyRoomSVG} alt="empty" />
            <span>{isHistory ? t("no-record") : t("no-room")}</span>
        </div>
    );
}

export function RoomListSkeletons(): ReactElement {
    return (
        <div className="room-list-skeletons">
            {Array(4)
                .fill(0)
                .map((_, i) => (
                    <Skeleton
                        key={i}
                        active
                        title={false}
                        paragraph={{
                            rows: 4,
                            width: ["13%", "50%", "13%", "13%"],
                        }}
                    />
                ))}
        </div>
    );
}

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
            <div className="room-list-body fancy-scrollbar">{children}</div>
        </div>
    );
}
