import "./style.less";

import React, { PropsWithChildren, ReactElement } from "react";
import { format } from "date-fns";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { RoomListLabel } from "../RoomListLabel";
import { RoomListItemButtonList } from "./RoomListItemButtonList";

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
                    {buttons && (
                        <RoomListItemButtonList buttons={buttons} onClickMenu={onClickMenu} />
                    )}
                </div>
            </div>
        </div>
    );
}
