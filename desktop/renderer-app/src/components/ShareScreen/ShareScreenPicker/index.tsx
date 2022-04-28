import "./style.less";

import { Button, Modal, Spin } from "antd";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ClassRoomStore } from "../../../stores/class-room-store";
import { ScreenList } from "./ScreenList";

interface ShareScreenPickerProps {
    classRoomStore: ClassRoomStore;
    handleOk: () => void;
}

const ShareScreenPickerModel = observer<ShareScreenPickerProps>(function ShareScreen({
    classRoomStore,
    handleOk,
}) {
    const { t } = useTranslation();

    useLayoutEffect(() => {
        classRoomStore.refreshShareScreenInfo();
    }, [classRoomStore]);

    const closeModal = useCallback(() => {
        classRoomStore.updateShowShareScreenPicker(false);
    }, [classRoomStore]);

    const isSelected = classRoomStore.selectedScreenInfo !== null;

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
                        loading: classRoomStore.shareScreenInfo.length === 0,
                    })}
                >
                    {classRoomStore.shareScreenInfo.length > 0 ? (
                        <ScreenList
                            classRoomStore={classRoomStore}
                            screenInfo={classRoomStore.shareScreenInfo}
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
    classRoomStore,
    handleOk,
}) {
    return classRoomStore.showShareScreenPicker ? (
        <ShareScreenPickerModel classRoomStore={classRoomStore} handleOk={handleOk} />
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
