import React from "react";
import classNames from "classnames";
import { VideoAvatar, VideoAvatarProps } from "../../components/VideoAvatar";

import noCameraSmall from "../../assets/image/no-camera-small.svg";

import "./SmallClassAvatar.less";

export interface SmallClassAvatarProps extends Omit<VideoAvatarProps, "children"> {}

export class SmallClassAvatar extends React.PureComponent<SmallClassAvatarProps> {
    render(): React.ReactNode {
        return <VideoAvatar {...this.props}>{this.renderMainContent}</VideoAvatar>;
    }

    private renderMainContent = (
        canvas: React.ReactNode,
        ctrlBtns: React.ReactNode,
    ): React.ReactNode => {
        const { avatarUser } = this.props;
        return (
            <section
                className={classNames("small-class-avatar-wrap", {
                    "with-video": avatarUser.camera,
                })}
            >
                {canvas}
                <div className="small-class-avatar-ctrl-layer">
                    <img
                        className="small-class-avatar-no-camera"
                        src={noCameraSmall}
                        alt="no camera"
                    />
                    <h1 className="small-class-avatar-title">{avatarUser.name}</h1>
                    {ctrlBtns}
                </div>
            </section>
        );
    };
}

export default SmallClassAvatar;
