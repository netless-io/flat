import "./style.less";

import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Switch } from "antd";
import { observer } from "mobx-react-lite";
import { FlatI18nTFunction, useTranslate } from "@netless/flat-i18n";
import { User } from "../../types/user";
import { IconMic } from "../ClassroomPage/VideoAvatar/IconMic";
import { SVGCamera, SVGCameraMute, SVGHandUp, SVGMicrophoneMute } from "../FlatIcons";

export interface UsersPanelRoomInfo {
    ownerName?: string;
    ownerAvatarURL?: string;
}

export interface UsersPanelProps {
    ownerUUID: string;
    userUUID: string;
    users: User[];
    roomInfo?: UsersPanelRoomInfo;
    getDeviceState?: (userUUID: string) => { camera: boolean; mic: boolean };
    getVolumeLevel?: (userUUID: string) => number;
    onOffStageAll?: () => void;
    onMuteAll?: () => void;
    onStaging?: (userUUID: string, isOnStage: boolean) => void;
    onWhiteboard?: (userUUID: string, enabled: boolean) => void;
    onDeviceState?: (userUUID: string, camera: boolean, mic: boolean) => void;
    generateAvatar?: (userUUID: string) => string;
}

export const UsersPanel = /* @__PURE__ */ observer<UsersPanelProps>(function UsersPanel({
    ownerUUID,
    userUUID,
    users,
    roomInfo,
    getDeviceState,
    getVolumeLevel,
    onOffStageAll,
    onMuteAll,
    onStaging,
    onWhiteboard,
    onDeviceState,
    generateAvatar,
}) {
    const t = useTranslate();

    const isCreator = ownerUUID === userUUID;

    return (
        <div className="users-panel">
            <div className="users-panel-headline">
                {roomInfo && (
                    <>
                        <span className="users-panel-headline-avatar">
                            <img src={roomInfo.ownerAvatarURL} />
                        </span>
                        <span className="users-panel-headline-name">{t("teacher")}: </span>
                        <span className="users-panel-headline-name">{roomInfo.ownerName}</span>
                    </>
                )}
                <span className="users-panel-splitter" />
                {isCreator && (
                    <>
                        <Button className="users-panel-btn" onClick={onOffStageAll}>
                            {t("all-off-stage")}
                        </Button>
                        <Button className="users-panel-btn" onClick={onMuteAll}>
                            {t("all-mute-mic")}
                        </Button>
                    </>
                )}
            </div>
            <div className="users-panel-list-wrapper">
                <table className="users-panel-list">
                    <thead>
                        <tr>
                            <th>
                                {t("members")} ({users.length})
                            </th>
                            <th>{t("staging")}</th>
                            <th>{t("whiteboard-access")}</th>
                            <th>{t("camera")}</th>
                            <th>{t("microphone")}</th>
                            <th>
                                {t("raised-hand")} ({users.filter(user => user.isRaiseHand).length})
                            </th>
                        </tr>
                    </thead>
                    <tbody className="users-panel-items">
                        {users.map(user => (
                            <Row
                                key={user.userUUID}
                                generateAvatar={generateAvatar}
                                getDeviceState={getDeviceState}
                                getVolumeLevel={getVolumeLevel}
                                isCreator={isCreator}
                                t={t}
                                user={user}
                                userUUID={userUUID}
                                onDeviceState={onDeviceState}
                                onStaging={onStaging}
                                onWhiteboard={onWhiteboard}
                            />
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="users-panel-list-empty">{t("no-students")}</div>
                )}
            </div>
        </div>
    );
});

interface RowProps {
    t: FlatI18nTFunction;
    isCreator: boolean;
    userUUID: string;
    user: User;
    getDeviceState: UsersPanelProps["getDeviceState"];
    getVolumeLevel: UsersPanelProps["getVolumeLevel"];
    onStaging: UsersPanelProps["onStaging"];
    onWhiteboard: UsersPanelProps["onWhiteboard"];
    onDeviceState: UsersPanelProps["onDeviceState"];
    generateAvatar: UsersPanelProps["generateAvatar"];
}

const Row = /* @__PURE__ */ observer(function Row({
    t,
    isCreator,
    userUUID,
    user,
    getDeviceState,
    getVolumeLevel: getAnyVolumeLevel,
    onStaging,
    onWhiteboard,
    onDeviceState,
    generateAvatar,
}: RowProps): React.ReactElement {
    const [isAvatarLoadFailed, setAvatarLoadFailed] = useState(false);

    const avatar =
        generateAvatar && (isAvatarLoadFailed || !user.avatar)
            ? generateAvatar(user.userUUID)
            : user.avatar;

    const [camera, setCamera] = useState(false);
    const [mic, setMic] = useState(false);
    const getVolumeLevel = useCallback(() => {
        return getAnyVolumeLevel?.(user.userUUID) || 0;
    }, [getAnyVolumeLevel, user.userUUID]);

    useEffect(() => {
        if (getDeviceState) {
            const timer = setInterval(() => {
                const { camera, mic } = getDeviceState(user.userUUID);
                setCamera(camera);
                setMic(mic);
            }, 500);
            return () => clearInterval(timer);
        }
        return;
    }, [getDeviceState, user.userUUID]);

    const isSelf = userUUID === user.userUUID;

    return (
        <tr className="users-panel-list-item">
            <td>
                <span className="users-panel-list-avatar-name">
                    <span className="users-panel-list-avatar">
                        <img src={avatar} onError={() => avatar && setAvatarLoadFailed(true)} />
                    </span>
                    {user.hasLeft ? (
                        <div className="users-panel-list-name-wrapper">
                            <span className="users-panel-list-name">
                                <span
                                    className={`users-panel-list-name-content ${
                                        isSelf ? "is-me" : ""
                                    }`}
                                >
                                    {user.name}
                                </span>
                                {isSelf && <span className="users-panel-is-self">{t("me")}</span>}
                            </span>
                            <span className="users-panel-list-has-left">{t("has-left")}</span>
                        </div>
                    ) : (
                        <span className="users-panel-list-name">
                            <span
                                className={`users-panel-list-name-content ${isSelf ? "is-me" : ""}`}
                            >
                                {user.name}
                            </span>
                            {isSelf && <span className="users-panel-is-self">{t("me")}</span>}
                        </span>
                    )}
                </span>
            </td>
            <td>
                <Switch
                    checked={user.isSpeak}
                    disabled={!(isCreator || (isSelf && user.isSpeak))}
                    size="small"
                    onChange={checked => onStaging?.(user.userUUID, checked)}
                />
            </td>
            <td>
                <Switch
                    checked={user.wbOperate}
                    disabled={!(isCreator || (isSelf && user.wbOperate))}
                    size="small"
                    onChange={checked => onWhiteboard?.(user.userUUID, checked)}
                />
            </td>
            <td>
                {user.isSpeak && getDeviceState ? (
                    <button
                        className="users-panel-media-btn is-camera"
                        disabled={!(isSelf || isCreator)}
                        onClick={() => onDeviceState?.(user.userUUID, !camera, mic)}
                    >
                        {camera ? <SVGCamera active /> : <SVGCameraMute />}
                    </button>
                ) : (
                    <span className="users-panel-media-off">--</span>
                )}
            </td>
            <td>
                {user.isSpeak && getDeviceState ? (
                    <button
                        className={classNames("users-panel-media-btn is-mic", {
                            "is-muted": !mic,
                        })}
                        disabled={!(isSelf || isCreator)}
                        onClick={() => onDeviceState?.(user.userUUID, camera, !mic)}
                    >
                        {mic ? <IconMic getVolumeLevel={getVolumeLevel} /> : <SVGMicrophoneMute />}
                    </button>
                ) : (
                    <span className="users-panel-media-off">--</span>
                )}
            </td>
            <td className="users-panel-btn-group">
                {user.isRaiseHand ? (
                    isCreator ? (
                        <>
                            <Button
                                className="users-panel-small-btn is-ok"
                                disabled={!isCreator}
                                size="small"
                                type="link"
                                onClick={() => isCreator && onStaging?.(user.userUUID, true)}
                            >
                                {t("agree")}
                            </Button>
                            <span
                                className={classNames("users-panel-small-btn-splitter", {
                                    "is-disabled": !isCreator,
                                })}
                            >
                                /
                            </span>
                            <Button
                                className="users-panel-small-btn is-cancel"
                                disabled={!isCreator}
                                size="small"
                                type="link"
                                onClick={() => isCreator && onStaging?.(user.userUUID, false)}
                            >
                                {t("cancel")}
                            </Button>
                        </>
                    ) : (
                        <SVGHandUp className="users-panel-small-btn is-hand" />
                    )
                ) : (
                    <span className="users-panel-media-off">--</span>
                )}
            </td>
        </tr>
    );
});
