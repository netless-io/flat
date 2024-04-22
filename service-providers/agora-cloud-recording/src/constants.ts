import {
    AgoraCloudRecordBackgroundConfigItem,
    AgoraCloudRecordLayoutConfigItem,
    AgoraCloudRecordStartRequestBody,
    AgoraCloudRecordUpdateLayoutRequestBody,
    RoomType,
} from "@netless/flat-server-api";

export enum AgoraCloudRecordingChannelType {
    Communication = 0,
    Broadcast = 1,
}

export const AVATAR_WIDTH = 128;
export const AVATAR_HEIGHT = 96;
export const MAX_AVATAR_COUNT = 15; // 128 * 15 = 1920
export const AVATAR_BAR_WIDTH = AVATAR_WIDTH * MAX_AVATAR_COUNT;

// https://docs.agora.io/cn/cloud-recording/recording_video_profile
export type RecordingConfig = AgoraCloudRecordStartRequestBody["clientRequest"]["recordingConfig"];

// not used, all use small class config
export const BIG_CLASS_RECORDING_CONFIG: RecordingConfig = {
    channelType: AgoraCloudRecordingChannelType.Broadcast,
    transcodingConfig: {
        width: 384,
        height: 216,
        fps: 15,
        bitrate: 280,
        mixedVideoLayout: 3,
        backgroundColor: "#000000",
        defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
        layoutConfig: [
            {
                x_axis: 0,
                y_axis: 0,
                width: 1,
                height: 1,
                alpha: 1.0,
                render_mode: 1,
            },
            {
                x_axis: 0.0,
                y_axis: 0.67,
                width: 0.33,
                height: 0.33,
                alpha: 1.0,
                render_mode: 1,
            },
        ],
    },
    maxIdleTime: 60,
    subscribeUidGroup: 0,
};

export const SMALL_CLASS_RECORDING_CONFIG: RecordingConfig = {
    channelType: AgoraCloudRecordingChannelType.Broadcast,
    transcodingConfig: {
        width: AVATAR_BAR_WIDTH,
        height: AVATAR_HEIGHT,
        fps: 15,
        bitrate: 500,
        mixedVideoLayout: 3,
        backgroundColor: "#FFFFFF",
        defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
        layoutConfig: [
            {
                x_axis: 0,
                y_axis: 0,
                width: AVATAR_WIDTH / AVATAR_BAR_WIDTH,
                height: 1,
            },
        ],
        backgroundConfig: [],
    },
    maxIdleTime: 5 * 60,
    subscribeUidGroup: 3,
};

// not used, all use small class config
export const ONE_TO_ONE_RECORDING_CONFIG: RecordingConfig = {
    channelType: AgoraCloudRecordingChannelType.Communication,
    transcodingConfig: {
        width: 384,
        height: 216,
        fps: 15,
        bitrate: 140,
        mixedVideoLayout: 1,
        backgroundColor: "#000000",
        defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
    },
    maxIdleTime: 60,
    subscribeUidGroup: 0,
};

export function getRecordingConfig(roomType: RoomType): RecordingConfig {
    switch (roomType) {
        case RoomType.BigClass:
        case RoomType.SmallClass:
        case RoomType.OneToOne: {
            return SMALL_CLASS_RECORDING_CONFIG;
        }
        default: {
            throw new Error("Unknown room type " + JSON.stringify(roomType));
        }
    }
}

export function convertRoomType(roomType: RoomType): AgoraCloudRecordingChannelType {
    if (roomType === RoomType.BigClass) {
        return AgoraCloudRecordingChannelType.Broadcast;
    } else {
        return AgoraCloudRecordingChannelType.Communication;
    }
}

// not used, all use small class config
export const BIG_CLASS_LAYOUT_CONFIG: AgoraCloudRecordLayoutConfigItem[] = [
    // creator
    { x_axis: 0, y_axis: 0, width: 1, height: 1, alpha: 1.0, render_mode: 1 },
    // joiner
    { x_axis: 0.0, y_axis: 0.67, width: 0.33, height: 0.33, alpha: 1.0, render_mode: 1 },
];

export function getClientRequest(
    roomType: RoomType,
    users: Array<{ uid: string; avatar: string }>,
): AgoraCloudRecordUpdateLayoutRequestBody["clientRequest"] {
    const backgroundConfig: AgoraCloudRecordBackgroundConfigItem[] = users.map(user => ({
        uid: user.uid,
        image_url: user.avatar,
    }));

    // if (roomType === RoomType.BigClass) {
    //     return {
    //         mixedVideoLayout: 3,
    //         backgroundColor: "#000000",
    //         defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
    //         backgroundConfig,
    //         layoutConfig: BIG_CLASS_LAYOUT_CONFIG,
    //     };
    // }

    if (
        roomType === RoomType.BigClass ||
        roomType === RoomType.SmallClass ||
        roomType === RoomType.OneToOne
    ) {
        return {
            mixedVideoLayout: 3,
            backgroundColor: "#FFFFFF",
            defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
            backgroundConfig,
            layoutConfig: users.map((_user, i) => ({
                x_axis: (i * AVATAR_WIDTH) / AVATAR_BAR_WIDTH,
                y_axis: 0,
                width: AVATAR_WIDTH / AVATAR_BAR_WIDTH,
                height: 1,
            })),
        };
    }

    // if (roomType === RoomType.OneToOne) {
    //     return {
    //         mixedVideoLayout: 1,
    //         backgroundColor: "#000000",
    //         defaultUserBackgroundImage: process.env.CLOUD_RECORDING_DEFAULT_AVATAR,
    //         backgroundConfig,
    //         layoutConfig: undefined,
    //     };
    // }

    throw new Error("Unknown room type " + JSON.stringify(roomType));
}
