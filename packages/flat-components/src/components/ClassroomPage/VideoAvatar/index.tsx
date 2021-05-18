import "./style.less";
import cameraSVG from "./icons/camera.svg";
import cameraDisabledSVG from "./icons/camera-disabled.svg";
import microphoneSVG from "./icons/microphone.svg";
import microphoneDisabledSVG from "./icons/microphone-disabled.svg";
import videoExpandSVG from "./icons/video-expand.svg";

import React, { PropsWithChildren } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";

export interface AvatarUser {
    name: string;
    userUUID: string;
    camera: boolean;
    mic: boolean;
    avatar: string;
}

export interface VideoAvatarBtnsProps {
    isCreator: boolean;
    userUUID: string;
    avatarUser: AvatarUser;
    updateDeviceState(id: string, camera: boolean, mic: boolean): void;
}

const VideoAvatarBtns = observer<VideoAvatarBtnsProps>(function VideoAvatarBtns({
    isCreator,
    userUUID,
    avatarUser,
    updateDeviceState,
}) {
    const isCameraCtrlDisable =
        avatarUser.userUUID !== userUUID && (!isCreator || !avatarUser.camera);

    const isMicCtrlDisable = avatarUser.userUUID !== userUUID && (!isCreator || !avatarUser.mic);

    return (
        <div className="video-avatar-ctrl-btns">
            <button
                onClick={() => {
                    if (isCreator || userUUID === avatarUser.userUUID) {
                        updateDeviceState(avatarUser.userUUID, !avatarUser.camera, avatarUser.mic);
                    }
                }}
                disabled={isCameraCtrlDisable}
            >
                <img src={avatarUser.camera ? cameraSVG : cameraDisabledSVG} alt="camera" />
            </button>
            <button
                onClick={() => {
                    if (isCreator || userUUID === avatarUser.userUUID) {
                        updateDeviceState(avatarUser.userUUID, avatarUser.camera, !avatarUser.mic);
                    }
                }}
                disabled={isMicCtrlDisable}
            >
                <img
                    src={avatarUser.mic ? microphoneSVG : microphoneDisabledSVG}
                    alt="microphone"
                />
            </button>
        </div>
    );
});

export interface BigClassAvatarProps extends PropsWithChildren<VideoAvatarBtnsProps> {
    small?: boolean;
    onExpand?: () => void;
}

export const BigClassAvatar = observer<BigClassAvatarProps>(function BigClassAvatar({
    avatarUser,
    small,
    onExpand,
    children: canvas,
    ...restProps
}) {
    return (
        <section className={classNames("big-class-avatar-wrap", { "is-small": small })}>
            {canvas}
            {!avatarUser.camera && (
                <div className="big-class-avatar-background">
                    <div
                        className="video-avatar-background"
                        style={{
                            backgroundImage: `url(${avatarUser.avatar})`,
                        }}
                    />
                    <img src={avatarUser.avatar} alt="no camera" />
                </div>
            )}
            <div
                className={classNames("big-class-avatar-ctrl-layer", {
                    "with-video": avatarUser.camera,
                })}
            >
                {small ? (
                    <button className="big-class-avatar-expand" onClick={onExpand}>
                        <img src={videoExpandSVG} alt="expand" />
                    </button>
                ) : (
                    <>
                        <h1 className="big-class-avatar-title">{avatarUser.name}</h1>
                        <VideoAvatarBtns avatarUser={avatarUser} {...restProps} />
                    </>
                )}
            </div>
        </section>
    );
});

export type SmallClassAvatarProps = PropsWithChildren<VideoAvatarBtnsProps>;

export const SmallClassAvatar = observer<SmallClassAvatarProps>(function ({
    avatarUser,
    children: canvas,
    ...restProps
}) {
    return (
        <section
            className={classNames("small-class-avatar-wrap", {
                "with-video": avatarUser.camera,
            })}
        >
            {canvas}
            {!avatarUser.camera && (
                <div className="small-class-avatar-background">
                    <div
                        className="video-avatar-background"
                        style={{
                            backgroundImage: `url(${avatarUser.avatar})`,
                        }}
                    ></div>
                    <img src={avatarUser.avatar} alt="no camera" />
                </div>
            )}
            <div className="small-class-avatar-ctrl-layer">
                <h1 className="small-class-avatar-title" title={avatarUser.name}>
                    {avatarUser.name}
                </h1>
                <VideoAvatarBtns avatarUser={avatarUser} {...restProps} />
            </div>
        </section>
    );
});

export type OneToOneAvatarProps = PropsWithChildren<VideoAvatarBtnsProps>;

export const OneToOneAvatar = observer<OneToOneAvatarProps>(function OneToOneAvatar({
    avatarUser,
    children: canvas,
    ...restProps
}) {
    return (
        <section className="one-to-one-avatar-wrap">
            {canvas}
            {!avatarUser.camera && (
                <div className="one-to-one-avatar-background">
                    <div
                        className="video-avatar-background"
                        style={{
                            backgroundImage: `url(${avatarUser.avatar})`,
                        }}
                    ></div>
                    <img src={avatarUser.avatar} alt="no camera" />
                </div>
            )}
            <div
                className={classNames("one-to-one-avatar-ctrl-layer", {
                    "with-video": avatarUser.camera,
                })}
            >
                <h1 className="one-to-one-avatar-title">{avatarUser.name}</h1>
                <VideoAvatarBtns avatarUser={avatarUser} {...restProps} />
            </div>
        </section>
    );
});
