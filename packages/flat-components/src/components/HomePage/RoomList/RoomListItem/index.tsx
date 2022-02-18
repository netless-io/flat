import "./style.less";

import React, { PropsWithChildren, ReactElement } from "react";
import { format } from "date-fns";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { RoomListItemMenus } from "./RoomListItemMenus";
import { RoomListItemAction, RoomListItemPrimaryAction, RoomStatusType } from "./types";

export * from "./types";

export interface RoomListItemProps<T extends string> {
    title: string;
    beginTime?: Date;
    endTime?: Date;
    ownerName?: string;
    ownerAvatar?: string;
    status: RoomStatusType;
    isPeriodic?: boolean;
    menuActions?: Array<RoomListItemAction<T>> | null;
    primaryAction?: RoomListItemPrimaryAction<T> | null;
    onAction: (key: T) => void;
    onClick?: () => void;
}

export function RoomListItem<T extends string = string>({
    title,
    beginTime,
    endTime,
    ownerName,
    ownerAvatar,
    status,
    isPeriodic,
    menuActions,
    primaryAction,
    onClick,
    onAction,
}: PropsWithChildren<RoomListItemProps<T>>): ReactElement {
    const { t } = useTranslation();
    return (
        <div className={classNames("room-list-item", { pointer: !!onClick })}>
            <div className="room-list-item-content">
                {ownerAvatar && (
                    <div className="room-list-item-left">
                        <figure className="room-list-item-owner-avatar" title={ownerName}>
                            <img alt={ownerName} src={ownerAvatar} />
                        </figure>
                    </div>
                )}
                <div className="room-list-item-middle" onClick={onClick}>
                    <h1 className="room-list-item-title">{title}</h1>
                    <div className="room-list-item-time-date">
                        <span className="room-list-item-time">
                            {beginTime && format(beginTime, "HH:mm")}
                            {" ~ "}
                            {endTime && format(endTime, "HH:mm")}
                        </span>
                        <span className="room-list-item-date">
                            {beginTime && format(beginTime, "yyyy/MM/dd")}
                        </span>
                        <span>{isPeriodic && `(${t("periodic")})`}</span>
                    </div>
                    <div>
                        <span
                            className={`room-list-item-status-${
                                status === "upcoming"
                                    ? "warning"
                                    : status === "running"
                                    ? "success"
                                    : "default"
                            }`}
                        >
                            {t(`room-status.${status}`)}
                        </span>
                    </div>
                </div>
                <div className="room-list-item-right">
                    {menuActions && <RoomListItemMenus actions={menuActions} onAction={onAction} />}
                    {primaryAction && (
                        <Button
                            key={primaryAction.key}
                            className="room-list-item-primary-action"
                            disabled={primaryAction.disabled}
                            type={primaryAction.type}
                            onClick={() => onAction(primaryAction.key)}
                        >
                            {primaryAction.text}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
