import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { ShareScreenStore } from "../../../stores/share-screen-store";
import { ScreenList } from "./ScreenList";
import "./style.less";

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
                centered
                bodyStyle={{
                    padding: "16px 0 0 16px",
                }}
                className="share-screen-picker-model"
                footer={[
                    <Button key="cancel" className="footer-button" onClick={closeModal}>
                        {t("cancel")}
                    </Button>,
                    <ConfirmButton key={"confirm"} handleOk={handleOk} isSelected={isSelected} />,
                ]}
                title={t("share-screen.choose-share-content")}
                visible={true}
                width="784px"
                onCancel={closeModal}
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
        <ShareScreenPickerModel handleOk={handleOk} shareScreenStore={shareScreenStore} />
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
            className="footer-button"
            disabled={!isSelected}
            loading={confirmLoading}
            type="primary"
            onClick={() => {
                setConfirmLoading(true);
                handleOk();
            }}
        >
            {t("confirm")}
        </Button>
    );
});
