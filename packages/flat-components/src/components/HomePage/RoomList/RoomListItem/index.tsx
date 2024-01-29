import "./style.less";

import React, {
    PropsWithChildren,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react";
import { format, isToday, isTomorrow, differenceInMinutes } from "date-fns";
import classNames from "classnames";
import { useTranslate } from "@netless/flat-i18n";
import { Button, Tooltip, message } from "antd";
import { RoomListItemMenus } from "./RoomListItemMenus";
import { RoomListItemAction, RoomListItemPrimaryAction, RoomStatusType } from "./types";
import { formatInviteCode } from "../../../../utils/room";

export * from "./types";

export interface RoomListItemProps<T extends string> {
    title: string;
    beginTime?: Date;
    endTime?: Date;
    ownerUUID?: string;
    ownerName?: string;
    ownerAvatar?: string;
    generateAvatar?: (uid: string) => string;
    status: RoomStatusType;
    inviteCode?: string;
    joinEarly?: number;
    isPmi?: boolean;
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
    ownerUUID,
    ownerName,
    ownerAvatar,
    generateAvatar,
    status,
    inviteCode,
    joinEarly = 5,
    isPmi,
    isPeriodic,
    menuActions,
    primaryAction,
    onClick,
    onAction,
}: PropsWithChildren<RoomListItemProps<T>>): ReactElement {
    const t = useTranslate();
    const [isAvatarLoadFailed, setAvatarLoadFailed] = useState(false);
    const [, forceUpdate] = useState(0);

    const copyInviteCode = useCallback(() => {
        const text = formatInviteCode("", inviteCode);
        navigator.clipboard.writeText(text);
        void message.success(t("copy-success"));
    }, [t]);

    const oneHour = 60;
    // Positive number means future: 5 = will start after 5 minutes
    const diffMinutes = beginTime ? differenceInMinutes(beginTime, new Date()) : null;

    // Force update after 1 minute to update the "will start after x minutes" text
    useEffect(() => {
        if (diffMinutes !== null && joinEarly <= diffMinutes && diffMinutes < oneHour) {
            const timer = setTimeout(
                () => forceUpdate(a => (a + 1) | 0),
                // Random delay to avoid performance issue
                60_000 + ((Math.random() * 3000) | 0),
            );
            return () => clearTimeout(timer);
        } else if (diffMinutes !== null && oneHour <= diffMinutes && diffMinutes < 24 * oneHour) {
            const timer = setTimeout(
                () => forceUpdate(a => (a + 1) | 0),
                (diffMinutes - oneHour + 1) * 60_000 + ((Math.random() * 3000) | 0),
            );
            return () => clearTimeout(timer);
        }
        return;
    }, [diffMinutes, forceUpdate]);

    const avatar =
        generateAvatar && ownerUUID && (isAvatarLoadFailed || !ownerAvatar)
            ? generateAvatar(ownerUUID)
            : ownerAvatar;

    let date = "";
    if (beginTime) {
        if (isToday(beginTime)) {
            date = t("today");
        } else if (isTomorrow(beginTime)) {
            date = t("tomorrow");
        } else {
            date = format(beginTime, "yyyy/MM/dd");
        }
    }

    const statusView = (
        <span
            className={`room-list-item-status-${
                status === "upcoming" ? "warning" : status === "running" ? "success" : "default"
            }`}
        >
            {t(`room-status.${status}`)}
        </span>
    );

    const primaryView = primaryAction && (
        <Button
            key={primaryAction.key}
            className="room-list-item-primary-action"
            disabled={primaryAction.disabled}
            type={primaryAction.type}
            onClick={() => onAction(primaryAction.key)}
        >
            {primaryAction.text}
        </Button>
    );

    let actionView: ReactNode = null;
    if (diffMinutes === null) {
        actionView = primaryView || statusView;
    } else if (joinEarly <= diffMinutes && diffMinutes < oneHour) {
        actionView = (
            <span className="room-list-item-status-success">
                {t("will-start-after-minutes", { minutes: diffMinutes })}
            </span>
        );
    } else {
        actionView = diffMinutes < joinEarly && primaryView ? primaryView : statusView;
    }

    return (
        <div className={classNames("room-list-item", { pointer: !!onClick })}>
            <div className="room-list-item-content">
                {avatar && (
                    <div className="room-list-item-left">
                        <figure className="room-list-item-owner-avatar" title={ownerName}>
                            <img
                                alt={ownerName}
                                src={avatar}
                                onError={() => avatar && setAvatarLoadFailed(true)}
                            />
                        </figure>
                    </div>
                )}
                <div className="room-list-item-middle" onClick={onClick}>
                    <h1 className="room-list-item-title">{title}</h1>
                    <div className="room-list-item-time-date">
                        <span className="room-list-item-time">
                            {beginTime && format(beginTime, "HH:mm")} ~{" "}
                            {endTime && format(endTime, "HH:mm")}
                        </span>
                        <span className="room-list-item-date">{date}</span>
                        <span>{isPeriodic && `(${t("periodic")})`}</span>
                        <span>{isPmi && `(${t("pmi")})`}</span>
                    </div>
                    <div>
                        {status !== "stopped" && inviteCode && inviteCode.length < 32 && (
                            <Tooltip
                                className="room-list-item-uuid-help"
                                placement="right"
                                title={t("copy")}
                            >
                                <button
                                    className={classNames("room-list-item-uuid")}
                                    onClick={copyInviteCode}
                                >
                                    {t("invite-suffix", { uuid: formatInviteCode("", inviteCode) })}
                                </button>
                            </Tooltip>
                        )}
                    </div>
                </div>
                <div className="room-list-item-right">
                    {menuActions && <RoomListItemMenus actions={menuActions} onAction={onAction} />}
                    {actionView}
                </div>
            </div>
        </div>
    );
}
