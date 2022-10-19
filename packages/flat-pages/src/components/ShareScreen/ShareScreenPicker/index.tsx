import "./style.less";

import React, { useCallback, useLayoutEffect, useState } from "react";
import classNames from "classnames";
import { useTranslate } from "@netless/flat-i18n";
import { ClassroomStore } from "@netless/flat-stores";
import { Button, Modal, Spin } from "antd";
import { observer } from "mobx-react-lite";

import { ScreenList } from "./ScreenList";

interface ShareScreenPickerProps {
    classroomStore: ClassroomStore;
    handleOk: () => void;
}

const ShareScreenPickerModel = observer<ShareScreenPickerProps>(function ShareScreen({
    classroomStore,
    handleOk,
}) {
    const t = useTranslate();

    useLayoutEffect(() => {
        classroomStore.refreshShareScreenInfo();
    }, [classroomStore]);

    const closeModal = useCallback(() => {
        classroomStore.toggleShareScreenPicker(false);
    }, [classroomStore]);

    const isSelected = classroomStore.selectedScreenInfo !== null;

    return (
        <div>
            <Modal
                centered
                open
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
                width="784px"
                onCancel={closeModal}
            >
                <div
                    className={classNames("share-screen-picker", {
                        loading: classroomStore.shareScreenInfo.length === 0,
                    })}
                >
                    {classroomStore.shareScreenInfo.length > 0 ? (
                        <ScreenList
                            classroomStore={classroomStore}
                            screenInfo={classroomStore.shareScreenInfo}
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
    classroomStore: classRoomStore,
    handleOk,
}) {
    return classRoomStore.shareScreenPickerVisible ? (
        <ShareScreenPickerModel classroomStore={classRoomStore} handleOk={handleOk} />
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
    const t = useTranslate();

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
