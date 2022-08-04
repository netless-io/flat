import React, { useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { TopBarRightBtn } from "../TopBar";
import { SVGRecord, SVGRecordStop } from "../../FlatIcons";
import { useSafePromise } from "../../../utils/hooks";

export type CloudRecordBtnProps = {
    isRecording: boolean;
    onClick: () => Promise<void>;
};

export const CloudRecordBtn: React.FC<CloudRecordBtnProps> = observer(
    ({ isRecording, onClick }) => {
        const sp = useSafePromise();
        const { t } = useTranslation();

        const [loading, setLoading] = useState(false);

        const handleClick = useCallback(async () => {
            setLoading(true);
            await sp(onClick());
            setLoading(false);
        }, [onClick, sp]);

        return (
            <TopBarRightBtn
                disabled={loading}
                icon={isRecording ? <SVGRecordStop active /> : <SVGRecord />}
                title={t("recording")}
                onClick={handleClick}
            />
        );
    },
);
