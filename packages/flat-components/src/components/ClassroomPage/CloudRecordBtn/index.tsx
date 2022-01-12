import { TopBarRightBtn } from "../";
import { observer } from "mobx-react-lite";
import React from "react";
import RecordIdleSVG from "./icons/record-idle.svg";
import RecordStartedSVG from "./icons/record-started.svg";

export type CloudRecordBtnProps = {
    isRecording: boolean;
    onClick: (evt: any) => void;
};

export const CloudRecordBtn: React.FC<CloudRecordBtnProps> = observer(
    ({ isRecording, onClick }) => {
        return (
            <TopBarRightBtn
                title={isRecording ? "Stop Recording" : "Start Recording"}
                icon={<img src={isRecording ? RecordStartedSVG : RecordIdleSVG} />}
                onClick={onClick}
            />
        );
    },
);
