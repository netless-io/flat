import "./style.less";

import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Switch } from "antd";
import { observer } from "mobx-react-lite";
import { FlatI18nTFunction, useTranslate } from "@netless/flat-i18n";
import { User } from "../../types/user";
import { IconMic } from "../ClassroomPage/VideoAvatar/IconMic";
import { SVGCamera, SVGCameraMute, SVGMicrophoneMute } from "../FlatIcons";

export interface UsersPanelProps {
    ownerUUID: string;
    userUUID: string;
    users: User[];
    getDeviceState?: (userUUID: string) => { camera: boolean; mic: boolean };
    getVolumeLevel?: (userUUID: string) => number;
    onOffStageAll?: () => void;
    onMuteAll?: () => void;
    onStaging?: (userUUID: string, isOnStage: boolean) => void;
    onWhiteboard?: (userUUID: string, enabled: boolean) => void;
    onDeviceState?: (userUUID: string, camera: boolean, mic: boolean) => void;
}

export const UsersPanel = /* @__PURE__ */ observer<UsersPanelProps>(function UsersPanel({
    ownerUUID,
    userUUID,
    users,
    getDeviceState,
    getVolumeLevel,
    onOffStageAll,
    onMuteAll,
    onStaging,
    onWhiteboard,
    onDeviceState,
}) {
    const t = useTranslate();

    const isCreator = ownerUUID === userUUID;
    const owner = users.find(user => user.userUUID === ownerUUID);
    const students = users.filter(user => user.userUUID !== ownerUUID);

    return (
        <div className="users-panel">
            <div className="users-panel-headline">
                {owner && (
                    <>
                        <span className="users-panel-headline-avatar">
                            <img src={owner.avatar} />
                        </span>
                        <span className="users-panel-headline-name">{t("teacher")}: </span>
                        <span className="users-panel-headline-name">{owner.name}</span>
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
                                {t("members")} ({students.length})
                            </th>
                            <th>{t("staging")}</th>
                            <th>{t("whiteboard-access")}</th>
                            <th>{t("camera")}</th>
                            <th>{t("microphone")}</th>
                            <th>
                                {t("raise-hand")} (
                                {students.filter(user => user.isRaiseHand).length})
                            </th>
                        </tr>
                    </thead>
                    <tbody className="users-panel-items">
                        {students.map(user => (
                            <Row
                                key={user.userUUID}
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
}: RowProps): React.ReactElement {
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
                        <img src={user.avatar} />
                    </span>
                    <span className="users-panel-list-name">{user.name}</span>
                </span>
            </td>
            <td>
                <Switch
                    checked={user.isSpeak}
                    disabled={!(isCreator || (isSelf && user.isSpeak))}
                    onChange={checked => onStaging?.(user.userUUID, checked)}
                />
            </td>
            <td>
                <Switch
                    checked={user.wbOperate}
                    disabled={!(isCreator || (isSelf && user.wbOperate))}
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
                    <span className="users-panel-media-off">-/-</span>
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
                    <span className="users-panel-media-off">-/-</span>
                )}
            </td>
            <td className="users-panel-btn-group">
                {user.isRaiseHand ? (
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
                    <span className="users-panel-media-off">-/-</span>
                )}
            </td>
        </tr>
    );
});
