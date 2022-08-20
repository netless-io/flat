import { observer } from "mobx-react-lite";
import React from "react";
import { useTranslate } from "@netless/flat-i18n";
import { TopBarRightBtn } from "../TopBar";
import { SVGRecord, SVGRecordStop } from "../../FlatIcons";

export type CloudRecordBtnProps = {
    isRecording: boolean;
    onClick: (evt: any) => void;
};

export const CloudRecordBtn: React.FC<CloudRecordBtnProps> = /* @__PURE__ */ observer(
    ({ isRecording, onClick }) => {
        const t = useTranslate();

        return (
            <TopBarRightBtn
                icon={isRecording ? <SVGRecordStop active /> : <SVGRecord />}
                title={t("recording")}
                onClick={onClick}
            />
        );
    },
);
