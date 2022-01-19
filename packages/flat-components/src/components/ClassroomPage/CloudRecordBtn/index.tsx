import React from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { TopBarRightBtn } from "../";
import RecordIdleSVG from "./icons/record-idle.svg";
import RecordStartedSVG from "./icons/record-started.svg";

export type CloudRecordBtnProps = {
    isRecording: boolean;
    onClick: (evt: any) => void;
};

export const CloudRecordBtn: React.FC<CloudRecordBtnProps> = observer(
    ({ isRecording, onClick }) => {
        const { t } = useTranslation();

        return (
            <TopBarRightBtn
                icon={<img src={isRecording ? RecordStartedSVG : RecordIdleSVG} />}
                title={t("recording")}
                onClick={onClick}
            />
        );
    },
);
