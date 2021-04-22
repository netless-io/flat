import "./index.less";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { ipcAsyncByMainWindow, ipcReceive, ipcReceiveRemove } from "../../utils/ipc";

export interface AppUpgradeModalProps {
    /** open modal when newVersion has truthy value */
    newVersion?: string;
    /** close modal  */
    onClose: () => void;
}

export const AppUpgradeModal = observer<AppUpgradeModalProps>(function AppUpgradeModal({
    newVersion,
    onClose,
}) {
    const [upgradePercent, setUpgradePercent] = useState(0);
    const [showUpgradeProgress, setShowUpgradeProgress] = useState(false);
    const [upgradeFail, setUpgradeFail] = useState(false);

    useEffect(() => {
        if (showUpgradeProgress) {
            ipcReceive("update-progress", args => {
                if (args.status) {
                    setUpgradePercent(args.percent);
                } else {
                    setUpgradeFail(true);
                }
            });

            ipcAsyncByMainWindow("start-update", undefined);
        }
        return () => {
            ipcReceiveRemove("update-progress");
        };
    }, [showUpgradeProgress]);

    const renderModalTitle = (): React.ReactNode => {
        return <div className="app-upgrade-modal-title">版本更新</div>;
    };

    const cancelUpgrade = (): void => {
        setShowUpgradeProgress(false);
        onClose();
    };

    const upgradeStart = (): void => {
        setShowUpgradeProgress(true);
    };

    return (
        <Modal
            keyboard={false}
            width={386}
            maskClosable={false}
            title={renderModalTitle()}
            footer={[]}
            visible={Boolean(newVersion)}
            onCancel={cancelUpgrade}
            wrapClassName="app-upgrade-modal-container"
            closable={false}
        >
            {showUpgradeProgress ? (
                <div>
                    <span className="app-upgrade-modal-font">
                        下载中 ({upgradePercent.toFixed(2)}%)...
                    </span>
                    <div className="app-upgrade-modal-progress"></div>
                    <div
                        className="app-upgrade-active-progress"
                        style={{ width: `${upgradePercent}%` }}
                    ></div>
                    {upgradeFail && (
                        <div>
                            <span className="app-upgrade-modal-font">更新失败，请重新打开程序</span>
                            <div className="app-upgrade-modal-btn">
                                <Button type="primary" onClick={() => window.close()}>
                                    确定
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <span className="app-upgrade-modal-font">
                        发现新版本{newVersion || " "}, 请更新到最新版本获取更好的产品体验
                    </span>
                    <div className="app-upgrade-modal-btn">
                        <Button type="primary" onClick={upgradeStart}>
                            立即更新
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
});
