// TODO: remove this component when multi sub window is Done
import cloudStorageSVG from "../assets/image/cloud-storage.svg";

import { Modal } from "antd";
import { TopBarRightBtn } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import { CloudStoragePanel } from "../pages/CloudStoragePage/CloudStoragePanel";
import { WhiteboardStore } from "../stores/WhiteboardStore";
import "./CloudStorageButton.less";

interface CloudStorageButtonProps {
    whiteboard: WhiteboardStore;
}

export const CloudStorageButton = observer<CloudStorageButtonProps>(function CloudStorageButton({
    whiteboard,
}) {
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
                title="我的云盘"
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
