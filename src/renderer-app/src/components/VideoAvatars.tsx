import * as React from "react";
import classNames from "classnames";
import type AgoraSDK from "agora-electron-sdk";
import { VideoAvatar, VideoType } from "./VideoAvatar";

import "./VideoAvatars.less";

export interface VideoAvatarsProps {
    localUid: number | null;
    remoteUids: number[];
    rtcEngine: AgoraSDK;
}

/** Video Calling Avatars with automatic layout */
export class VideoAvatars extends React.PureComponent<VideoAvatarsProps> {
    render() {
        const { localUid, remoteUids, rtcEngine } = this.props;

        if (process.env.NODE_ENV === "development") {
            console.log("agora users", localUid, remoteUids);
        }

        return localUid === null ? null : (
            <div className={classNames("video-avatar-container", `with-${remoteUids.length}`)}>
                <VideoAvatar type={VideoType.local} uid={localUid} rtcEngine={rtcEngine} />
                {remoteUids.map(uid => (
                    <VideoAvatar
                        key={uid}
                        type={VideoType.remote}
                        uid={uid}
                        rtcEngine={rtcEngine}
                    />
                ))}
            </div>
        );
    }
}

export default VideoAvatars;
