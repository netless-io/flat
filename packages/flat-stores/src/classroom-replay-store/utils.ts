import { usersInfo } from "@netless/flat-server-api";
import { toJS } from "mobx";
import Hls from "hls.js";

import { RoomRecording, roomStore } from "../room-store";

export interface UserRecordingInfo {
    name: string;
    rtcUID: number;
    avatarURL: string;
    videoURL: string;
}

// use RoomRecording instead
/** @deprecated because we do not use individual recording mode, use RoomRecording instead */
export interface Recording extends RoomRecording {
    users?: Record<string, UserRecordingInfo>;
}

export async function existsUrl(url: string): Promise<boolean> {
    try {
        const r = await fetch(url, { method: "HEAD" });
        return r.ok;
    } catch {
        return false;
    }
}

/** @deprecated because we do not use individual recording mode */
export async function getRecordings(roomUUID: string): Promise<Recording[]> {
    await roomStore.syncRecordInfo(roomUUID);
    const room = roomStore.rooms.get(roomUUID)!;
    const data = await usersInfo({ roomUUID });
    const recordings = toJS(room?.recordings) || [];

    const result = [];
    for (const r of recordings) {
        // 0. Old recording data
        if (!r.videoURL || (await existsUrl(r.videoURL))) {
            result.push(r);
            continue;
        }
        // 1. Remove the url when it does not exist.
        const baseURL = r.videoURL;
        r.videoURL = "";
        // 2. Find all url of each user.
        let existUsers = 0;
        const users: Record<string, UserRecordingInfo> = {};
        for (const userUUID in data) {
            const { rtcUID } = data[userUUID];
            const videoURL = baseURL.replace(/\.m3u8$/i, `__uid_s_${rtcUID}__uid_e_av.m3u8`);
            if (await existsUrl(videoURL)) {
                existUsers++;
                users[userUUID] = Object.assign({ videoURL }, data[userUUID]);
            }
        }
        // 3. If we have users' videos, return them, otherwise as if no video.
        if (existUsers) {
            result.push(Object.assign({ users }, r));
        } else {
            result.push(r);
        }
    }

    return result;
}

export async function getRoomRecordings(roomUUID: string): Promise<RoomRecording[]> {
    await roomStore.syncRecordInfo(roomUUID);
    const room = roomStore.rooms.get(roomUUID)!;
    const recordings = toJS(room?.recordings) || [];
    // Remove buggy recordings
    return recordings.filter(e => e.beginTime < e.endTime);
}

const M3U8_EXT = /\.m3u8$/i;

export function makeVideoPlayer(url: string): HTMLVideoElement {
    const $video = document.createElement("video");
    const $source = document.createElement("source");
    $source.src = url;
    $video.appendChild($source);

    if (M3U8_EXT.test(url)) {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia($video);
        } else if ($video.canPlayType("application/vnd.apple.mpegurl")) {
            $video.src = url;
        }
    }

    return $video;
}
