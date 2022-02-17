import "./style.less";

import React, { PropsWithChildren, ReactElement, useMemo } from "react";
import { format } from "date-fns";
import classNames from "classnames";
import { Button, Dropdown, Menu, Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { RoomListLabel } from "./RoomListLabel";
import { SVGDown } from "../../FlatIcons";

export * from "./RoomListEmpty";

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
            <div className="room-list-item-content">
                <div
                    className={classNames("room-list-item-left", { pointer: !!onClick })}
                    onClick={onClick}
                >
                    <div className="room-list-item-title-wrap">
                        <h1 className="room-list-item-title">{title}</h1>
                        {isPeriodic && (
                            <RoomListLabel type="primary">{t("periodic")}</RoomListLabel>
                        )}
                    </div>
                    <div className="room-list-item-info">
                        {beginTime && (
                            <RoomListLabel>
                                {beginTime && format(beginTime, "yyyy/MM/dd")}
                            </RoomListLabel>
                        )}
                        {(beginTime || endTime) && (
                            <RoomListLabel>
                                {beginTime && format(beginTime, "HH:mm")}
                                {" ~ "}
                                {endTime && format(endTime, "HH:mm")}
                            </RoomListLabel>
                        )}
                        <RoomListLabel
                            type={
                                status === "upcoming"
                                    ? "warning"
                                    : status === "running"
                                    ? "success"
                                    : undefined
                            }
                        >
                            {t(`room-status.${status}`)}
                        </RoomListLabel>
                    </div>
                </div>
                <div className="room-list-item-right">
                    {buttons && renderButtons(buttons, onClickMenu)}
                </div>
            </div>
        </div>
    );
}

function renderButtons<T extends string>(
    buttons: RoomListItemButtons<T>,
    onClickMenu?: (key: T) => void,
): React.ReactNode {
    return buttons.map(buttonConfig => {
        if (Array.isArray(buttonConfig)) {
            return renderSubMenu(buttonConfig, "room-list-item-sub-menu", onClickMenu);
        } else {
            const { key, text, disabled } = buttonConfig;
            return (
                <Button
                    key={key}
                    disabled={disabled}
                    type="primary"
                    onClick={() => onClickMenu?.(key)}
                >
                    {text}
                </Button>
            );
        }
    });
}

function renderSubMenu<T extends string>(
    buttons: Array<RoomListItemButton<T>>,
    overlayClassName?: string,
    onClickMenu?: (key: T) => void,
): React.ReactNode {
    return (
        <Dropdown
            key={buttons.map(button => button.key).join("-")}
            overlay={
                <Menu>
                    {buttons.map(button => (
                        <Menu.Item key={button.key} onClick={() => onClickMenu?.(button.key)}>
                            {button.text}
                        </Menu.Item>
                    ))}
                </Menu>
            }
            overlayClassName={overlayClassName}
            trigger={["click"]}
        >
            <Button className="room-list-item-more">...</Button>
        </Dropdown>
    );
}

export function RoomListAlreadyLoaded(): ReactElement {
    const { t } = useTranslation();

    return <div className="room-list-footer">{t("loaded-all")}</div>;
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
                        paragraph={{ rows: 4, width: ["13%", "50%", "13%", "13%"] }}
                        title={false}
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
    const activeTabTitle = useMemo(
        () => filters?.find(tab => tab.key === activeTab)?.title,
        [filters, activeTab],
    );

    return (
        <div className="room-list" style={style}>
            <div className="room-list-header">
                <div className="room-list-title">{title}</div>
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
