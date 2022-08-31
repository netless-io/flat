import type { Recording } from "@netless/flat-stores/src/classroom-replay-store/utils";

import { Button, Dropdown, DropdownProps, Menu, Slider, Spin, Tag } from "antd";
import format from "date-fns/format";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";

import { ClassroomReplayStore } from "@netless/flat-stores";
import { SVGRecord, SVGPause, SVGPlay, useSafePromise } from "flat-components";
import { LoadingOutlined } from "@ant-design/icons";

export interface ReplayListProps {
    classroomReplayStore: ClassroomReplayStore;
}

const Trigger: DropdownProps["trigger"] = ["click"];

export const ReplayList = observer<ReplayListProps>(function ReplayList({ classroomReplayStore }) {
    const sp = useSafePromise();
    const { currentRecording, recordings } = classroomReplayStore;
    const [loadingRecording, setLoading] = useState(false);

    const loadRecording = useCallback(
        async (recording: Recording): Promise<void> => {
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

    return (
        <div className="replay-playlist">
            {currentRecording && (
                <Slider
                    className="replay-progress"
                    max={currentRecording.endTime}
                    min={currentRecording.beginTime}
                    tipFormatter={time => time && format(time, "Y-MM-dd hh:mm:ss.SS")}
                    value={classroomReplayStore.currentTimestamp}
                    onChange={classroomReplayStore.seek}
                />
            )}
            <span className="replay-playlist-dropdown-wrapper">
                <Dropdown
                    className="replay-playlist-dropdown"
                    overlay={
                        <Menu
                            items={recordings.map((r, i) => ({
                                key: i,
                                label: renderTime(r),
                            }))}
                            onClick={({ key }) => loadRecording(recordings[+key])}
                        />
                    }
                    trigger={Trigger}
                >
                    <Button className="replay-select-playlist" disabled={loading} type="primary">
                        <SVGRecord />
                    </Button>
                </Dropdown>
            </span>
            <Button
                disabled={!currentRecording || loading}
                onClick={classroomReplayStore.togglePlayPause}
            >
                {classroomReplayStore.isPlaying ? <SVGPause /> : <SVGPlay />}
            </Button>
            {currentRecording && (
                <Tag color={loading ? "yellow" : "blue"}>
                    <div className="replay-current-recording">
                        {loading && <Spin indicator={<LoadingOutlined spin />} />}
                        {loading ? "Loading" : "Now Playing"}: {renderTime(currentRecording)}
                    </div>
                </Tag>
            )}
            <div className="replay-splitter"></div>
            <div className="replay-time">
                {format(classroomReplayStore.currentTimestamp, "hh:mm:ss")}
            </div>
        </div>
    );
});

function renderTime({ beginTime, endTime }: Record<"beginTime" | "endTime", number>): string {
    return format(beginTime, "Y-MM-dd hh:mm:ss") + " ~ " + format(endTime, "Y-MM-dd hh:mm:ss");
}
