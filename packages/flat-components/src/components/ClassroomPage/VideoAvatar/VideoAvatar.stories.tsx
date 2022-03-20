import React from "react";
import { Meta, Story } from "@storybook/react";
import faker from "faker";
import { VideoAvatar, VideoAvatarProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/VideoAvatar",
    component: VideoAvatar,
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

export const Overview: Story<
    Omit<VideoAvatarProps, "getVolumeLevel"> & { getVolumeLevel: number }
> = ({ getVolumeLevel: volumeLevel, ...restProps }) => {
    return (
        <div className="flex items-center">
            <div className="mh3" style={{ width: 300, height: 200 }}>
                <VideoAvatar getVolumeLevel={() => volumeLevel} {...restProps} />
            </div>
            <div className="mh3" style={{ width: 150, height: 200 }}>
                <VideoAvatar getVolumeLevel={() => volumeLevel} {...restProps} />
            </div>
            <div className="mh3" style={{ width: 150, height: 100 }}>
                <VideoAvatar getVolumeLevel={() => volumeLevel} {...restProps} small />
            </div>
        </div>
    );
};
Overview.args = {
    userUUID: "",
    isCreator: faker.datatype.boolean(),
    avatarUser: {
        avatar: "http://placekitten.com/64/64",
        mic: faker.datatype.boolean(),
        camera: false,
        name: faker.random.words(20),
        userUUID: "",
    },
};
Overview.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

export const LongName: Story<Omit<VideoAvatarProps, "getVolumeLevel"> & { getVolume: number }> = ({
    getVolume: volumeLevel,
    ...restProps
}) => {
    return (
        <div className="flex items-center">
            <div className="mh3" style={{ width: 300, height: 200 }}>
                <VideoAvatar getVolumeLevel={() => volumeLevel} {...restProps} />
            </div>
            <div className="mh3" style={{ width: 150, height: 200 }}>
                <VideoAvatar getVolumeLevel={() => volumeLevel} {...restProps} />
            </div>
            <div className="mh3" style={{ width: 150, height: 100 }}>
                <VideoAvatar getVolumeLevel={() => volumeLevel} {...restProps} small />
            </div>
        </div>
    );
};
LongName.args = {
    userUUID: "",
    isCreator: faker.datatype.boolean(),
    avatarUser: {
        avatar: "http://placekitten.com/64/64",
        mic: faker.datatype.boolean(),
        camera: false,
        name: faker.random.words(20),
        userUUID: "",
    },
};
LongName.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};
