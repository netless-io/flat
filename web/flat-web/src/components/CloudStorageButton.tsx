// TODO: remove this component when multi sub window is Done
import cloudStorageSVG from "../assets/image/cloud-storage.svg";

import { Modal } from "antd";
import { TopBarRightBtn } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import { CloudStoragePanel } from "../pages/CloudStoragePage/CloudStoragePanel";
import { WhiteboardStore } from "../stores/whiteboard-store";
import "./CloudStorageButton.less";
import { useTranslation } from "react-i18next";

interface CloudStorageButtonProps {
    whiteboard: WhiteboardStore;
}

export const CloudStorageButton = observer<CloudStorageButtonProps>(function CloudStorageButton({
    whiteboard,
}) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const hideModal = useCallback(() => setVisible(false), [setVisible]);
    const showModal = useCallback(() => setVisible(true), [setVisible]);

    if (!whiteboard.isWritable) {
        return null;
    }

    return (
        <>
            <TopBarRightBtn
                title="Open Cloud Storage"
                icon={<img src={cloudStorageSVG} />}
                onClick={showModal}
            />
            <Modal
                title={t("my-cloud ")}
                onCancel={hideModal}
                destroyOnClose
                footer={[]}
                visible={visible}
                className="cloud-storage-button-modal"
                centered
            >
                <CloudStoragePanel whiteboard={whiteboard} onCoursewareInserted={hideModal} />
            </Modal>
        </>
    );
});
