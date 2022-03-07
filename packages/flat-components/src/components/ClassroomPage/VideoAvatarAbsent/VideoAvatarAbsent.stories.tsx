import React from "react";
import { Meta, Story } from "@storybook/react";
import { VideoAvatarAbsent, VideoAvatarAbsentProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/VideoAvatarAbsent",
    component: VideoAvatarAbsent,
    argTypes: {
        getVolumeLevel: {
            control: { type: "range", min: 0, max: 1, step: 0.01 },
        },
        small: {
            control: false,
        },
    },
};

export default storyMeta;

export const Overview: Story<VideoAvatarAbsentProps> = props => {
    return (
        <div className="flex items-center">
            <div className="mh3" style={{ width: 300, height: 200 }}>
                <VideoAvatarAbsent {...props} />
            </div>
            <div className="mh3" style={{ width: 150, height: 200 }}>
                <VideoAvatarAbsent {...props} />
            </div>
            <div className="mh3" style={{ width: 150, height: 100 }}>
                <VideoAvatarAbsent {...props} small />
            </div>
        </div>
    );
};
