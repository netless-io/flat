import "./style.less";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal, Spin } from "antd";
import { ShareScreenStore } from "../../../stores/share-screen-store";
import { ScreenList } from "./ScreenList";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

interface ShareScreenPickerProps {
    shareScreenStore: ShareScreenStore;
    handleOk: () => void;
}

const ShareScreenPickerModel = observer<ShareScreenPickerProps>(function ShareScreen({
    shareScreenStore,
    handleOk,
}) {
    const { t } = useTranslation();

    useLayoutEffect(() => {
        shareScreenStore.resetScreenInfo();
    }, [shareScreenStore]);

    useEffect(() => {
        shareScreenStore.updateScreenInfo();
    }, [shareScreenStore]);

    const closeModal = useCallback(() => {
        shareScreenStore.updateShowShareScreenPicker(false);
    }, [shareScreenStore]);

    const isSelected = shareScreenStore.shareSymbol !== null;

    return (
        <div>
            <Modal
                title={t("share-screen.choose-share-content")}
                onCancel={closeModal}
                visible={true}
                bodyStyle={{
                    padding: "16px 0 0 16px",
                }}
                className="share-screen-picker-model"
                centered
                width="784px"
                footer={[
                    <Button key="cancel" onClick={closeModal} className="footer-button">
                        {t("cancel")}
                    </Button>,
                    <ConfirmButton key={"confirm"} isSelected={isSelected} handleOk={handleOk} />,
                ]}
            >
                <div
                    className={classNames("share-screen-picker", {
                        loading: shareScreenStore.screenInfo === null,
                    })}
                >
                    {shareScreenStore.screenInfo ? (
                        <ScreenList
                            screenInfo={shareScreenStore.screenInfo}
                            shareScreenStore={shareScreenStore}
                        />
                    ) : (
                        <Spin size="large" />
                    )}
                </div>
            </Modal>
        </div>
    );
});

export const ShareScreenPicker = observer<ShareScreenPickerProps>(function ShareScreen({
    shareScreenStore,
    handleOk,
}) {
    return shareScreenStore.showShareScreenPicker ? (
        <ShareScreenPickerModel shareScreenStore={shareScreenStore} handleOk={handleOk} />
    ) : null;
});

interface ConfirmButtonProps {
    isSelected: boolean;
    handleOk: () => void;
}

const ConfirmButton = observer<ConfirmButtonProps>(function ConfirmButton({
    isSelected,
    handleOk,
}) {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const { t } = useTranslation();

    return (
        <Button
            key="submit"
            type="primary"
            className="footer-button"
            disabled={!isSelected}
            onClick={() => {
                setConfirmLoading(true);
                handleOk();
            }}
            loading={confirmLoading}
        >
            {t("confirm")}
        </Button>
    );
});
