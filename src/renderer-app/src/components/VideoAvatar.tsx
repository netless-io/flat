import * as React from "react";
import type AgoraSDK from "agora-electron-sdk";

export enum VideoType {
    remote,
    local,
}

export interface VideoAvatarProps {
    type: VideoType;
    uid: number;
    rtcEngine: AgoraSDK;
}

/** Video Calling Avatar */
export class VideoAvatar extends React.PureComponent<VideoAvatarProps> {
    setupVideo = (el: HTMLDivElement | null): void => {
        if (el) {
            const { type, uid, rtcEngine } = this.props;
            switch (type) {
                case VideoType.local: {
                    rtcEngine.setupLocalVideo(el);
                    break;
                }
                default: {
                    rtcEngine.setupRemoteVideo(uid, el);
                    break;
                }
            }
        }
    };

    render() {
        return <div className="video-avatar" ref={this.setupVideo}></div>;
    }
}

export default VideoAvatar;
