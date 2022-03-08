import { observer } from "mobx-react-lite";
import React from "react";
import { useTranslation } from "react-i18next";
import { TopBarRightBtn } from "../TopBar";
import { SVGRecord, SVGRecordStop } from "../../FlatIcons";

export type CloudRecordBtnProps = {
    isRecording: boolean;
    onClick: (evt: any) => void;
};

export const CloudRecordBtn: React.FC<CloudRecordBtnProps> = observer(
    ({ isRecording, onClick }) => {
        const { t } = useTranslation();

        return (
            <TopBarRightBtn
                icon={isRecording ? <SVGRecordStop active /> : <SVGRecord />}
                title={t("recording")}
                onClick={onClick}
            />
        );
    },
);
