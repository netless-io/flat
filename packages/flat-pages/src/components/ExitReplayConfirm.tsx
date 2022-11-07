import React, { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { Button, Modal } from "antd";
import { WindowsSystemBtnContext } from "./StoreProvider";

interface ExitReplayConfirmProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    onSendWindowWillClose: () => void;
}

export const ExitReplayConfirm = observer<ExitReplayConfirmProps>(function ExitReplayConfirm({
    visible,
    onCancel,
    onConfirm,
    onSendWindowWillClose,
}) {
    const t = useTranslate();

    const windowsBtn = useContext(WindowsSystemBtnContext);

    useEffect(() => {
        if (windowsBtn) {
            windowsBtn.sendWindowWillCloseEvent(onSendWindowWillClose);
            return () => {
                windowsBtn.removeWindowWillCloseEvent();
            };
        }
        return;
    });
    return (
        <Modal
            footer={[
                <Button key="exit-cancel" onClick={onCancel}>
                    {t("cancel")}
                </Button>,
                <Button key="exit-confirm" onClick={onConfirm}>
                    {t("confirm")}
                </Button>,
            ]}
            open={visible}
            title={t("exit-replay")}
            onCancel={onCancel}
        >
            {t("exit-reply-tips")}
        </Modal>
    );
});

export default ExitReplayConfirm;
