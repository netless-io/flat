import React from "react";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";

import { TopBarRightBtn } from "../TopBar";
import { SVGRecord, SVGRecordStop } from "../../FlatIcons";

export type CloudRecordBtnProps = {
    loading?: boolean;
    isRecording: boolean;
    onClick: () => void;
};

export const CloudRecordBtn: React.FC<CloudRecordBtnProps> = /* @__PURE__ */ observer(
    ({ loading, isRecording, onClick }) => {
        const t = useTranslate();

        return (
            <TopBarRightBtn
                disabled={loading}
                icon={isRecording ? <SVGRecordStop active /> : <SVGRecord />}
                title={t("recording")}
                onClick={onClick}
            />
        );
    },
);
