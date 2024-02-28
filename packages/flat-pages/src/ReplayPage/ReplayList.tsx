import { Button, Dropdown, DropdownProps, Menu, Slider, Spin, Tag, message } from "antd";
import type { SliderTooltipProps } from "antd/lib/slider";
import format from "date-fns/format";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";

import { LoadingOutlined } from "@ant-design/icons";
import { FlatI18nTFunction, useTranslate } from "@netless/flat-i18n";
import { ClassroomReplayStore, RoomRecording } from "@netless/flat-stores";
import {
    SVGFastForward15,
    SVGPause,
    SVGPlay,
    SVGRecordList,
    SVGRewind15,
    SVGShare,
    useSafePromise,
} from "flat-components";
import { FLAT_WEB_BASE_URL } from "../constants/process";

export interface ReplayListProps {
    classroomReplayStore: ClassroomReplayStore;
}

const Trigger: DropdownProps["trigger"] = ["click"];

export const ReplayList = observer<ReplayListProps>(function ReplayList({ classroomReplayStore }) {
    const t = useTranslate();
    const sp = useSafePromise();
    const { currentRecording, recordings } = classroomReplayStore;
    const [loadingRecording, setLoading] = useState(false);
    const currentRecordingIndex = currentRecording ? recordings.indexOf(currentRecording) : -1;

    const loadRecording = useCallback(
        async (recording: RoomRecording): Promise<void> => {
            setLoading(true);
            await sp(classroomReplayStore.loadRecording(recording));
            setLoading(false);
        },
        [classroomReplayStore, sp],
    );

    const loading = loadingRecording || classroomReplayStore.isBuffering;

    useEffect(() => {
        if (!currentRecording && recordings.length > 0) {
            loadRecording(recordings[0]);
        }
    }, [currentRecording, loadRecording, recordings, recordings.length]);

    const tooltipFormatter: SliderTooltipProps["formatter"] = useCallback(
        time => time && currentRecording && renderPlayerTime(time - currentRecording.beginTime),
        [currentRecording],
    );

    const copyShareLink = useCallback(async () => {
        const { roomType, roomUUID, ownerUUID } = classroomReplayStore;
        const url = `${FLAT_WEB_BASE_URL}/replay/${roomType}/${roomUUID}/${ownerUUID}`;
        await navigator.clipboard.writeText(url);
        void message.success(t("copy-success"));
    }, [classroomReplayStore, t]);

    return (
        <div className="replay-playlist">
            {currentRecording && (
                <Slider
                    className="replay-progress"
                    max={currentRecording.endTime}
                    min={currentRecording.beginTime}
                    tooltip={{ formatter: tooltipFormatter }}
                    value={classroomReplayStore.currentTimestamp}
                    onChange={classroomReplayStore.seek}
                />
            )}
            <Button
                disabled={!currentRecording || loading}
                onClick={() => classroomReplayStore.fastForward(-15_000)}
            >
                <SVGRewind15 />
            </Button>
            <Button
                disabled={!currentRecording || loading}
                onClick={classroomReplayStore.togglePlayPause}
            >
                {classroomReplayStore.isPlaying ? <SVGPause /> : <SVGPlay />}
            </Button>
            <Button
                disabled={!currentRecording || loading}
                onClick={() => classroomReplayStore.fastForward(15_000)}
            >
                <SVGFastForward15 />
            </Button>
            {currentRecording && (
                <Tag color={loading ? "yellow" : "blue"}>
                    <div className="replay-current-recording">
                        {loading && <Spin indicator={<LoadingOutlined spin />} />}
                        {loading ? t("replay-page.loading") : t("replay-page.playing")}
                        {": "}
                        {renderTime(t, currentRecordingIndex, currentRecording)}
                    </div>
                </Tag>
            )}
            <div className="replay-splitter"></div>
            {classroomReplayStore.duration > 0 && (
                <div className="replay-time">
                    {renderPlayerTime(classroomReplayStore.currentTime)}/
                    {renderPlayerTime(classroomReplayStore.duration)}
                </div>
            )}
            <span className="replay-playlist-dropdown-wrapper">
                <Dropdown
                    className="replay-playlist-dropdown"
                    overlay={
                        <Menu
                            items={recordings.map((r, i) => ({
                                key: i,
                                label: renderTime(t, i, r),
                            }))}
                            onClick={({ key }) => loadRecording(recordings[+key])}
                        />
                    }
                    placement="topRight"
                    trigger={Trigger}
                >
                    <Button className="replay-select-playlist" disabled={loading}>
                        <SVGRecordList />
                    </Button>
                </Dropdown>
            </span>
            <Button className="replay-share" title="copy share link" onClick={copyShareLink}>
                <SVGShare />
            </Button>
        </div>
    );
});

function renderTime(
    t: FlatI18nTFunction,
    i: number,
    record?: Record<"beginTime" | "endTime", number>,
): string {
    let string = t("record-nth", { nth: i + 1 });
    if (record) {
        const { beginTime, endTime } = record;
        string += " (" + format(beginTime, "HH:mm:ss") + " ~ " + format(endTime, "HH:mm:ss") + ")";
    }
    return string;
}

function renderPlayerTime(ms: number): string {
    const seconds = (ms / 1000) | 0;
    const minutes = (seconds / 60) | 0;
    const hours = (minutes / 60) | 0;
    return `${pad2(hours)}:${pad2(minutes % 60)}:${pad2(seconds % 60)}`;
}

function pad2(i: number): string {
    return i.toString().padStart(2, "0");
}
