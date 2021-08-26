import "./style.less";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal, Spin } from "antd";
import { ShareScreenStore } from "../../../stores/ShareScreenStore";
import { ScreenList } from "./ScreenList";
import classNames from "classnames";

interface ShareScreenPickerProps {
    shareScreenStore: ShareScreenStore;
    handleOk: () => void;
}

const ShareScreenPickerModel = observer<ShareScreenPickerProps>(function ShareScreen({
    shareScreenStore,
    handleOk,
}) {
    const [confirmLoading, setConfirmLoading] = useState(false);

    useLayoutEffect(() => {
        shareScreenStore.resetScreenInfo();
    }, [shareScreenStore]);

    useEffect(() => {
        shareScreenStore.updateScreenInfo();
    }, [shareScreenStore]);

    const closeModal = useCallback(() => {
        shareScreenStore.updateShowShareScreenPicker(false);
    }, [shareScreenStore]);

    const isSelected =
        shareScreenStore.isDisplayScreen !== null && shareScreenStore.screenID !== null;

    return (
        <div>
            <Modal
                title="选择共享内容"
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
                        取消
                    </Button>,
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
                        确认
                    </Button>,
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
