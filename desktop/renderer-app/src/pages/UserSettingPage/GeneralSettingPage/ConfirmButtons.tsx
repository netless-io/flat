import React, { useCallback, useState } from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { useSafePromise } from "../../../utils/hooks/lifecycle";

export interface ConfirmButtonsProps {
    onConfirm: () => Promise<void>;
}

export const ConfirmButtons: React.FC<ConfirmButtonsProps> = ({ onConfirm }) => {
    const sp = useSafePromise();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [phase, setPhase] = useState<"idle" | "confirm">("idle");

    const confirm = useCallback(async () => {
        setLoading(true);
        await sp(onConfirm().catch(console.error));
        setLoading(false);
        setPhase("idle");
    }, [onConfirm, sp]);

    if (phase === "idle") {
        return (
            <Button type="link" onClick={() => setPhase("confirm")}>
                {t("modify")}
            </Button>
        );
    } else {
        return (
            <>
                <Button disabled={loading} loading={loading} type="primary" onClick={confirm}>
                    {t("confirm")}
                </Button>
                <Button onClick={() => setPhase("idle")}>{t("cancel")}</Button>
            </>
        );
    }
};
