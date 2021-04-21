import "./index.less";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useState } from "react";
import { GlobalStoreContext } from "../StoreProvider";
import { ipcAsyncByMainWindow, ipcReceive, ipcReceiveRemove, ipcSyncByApp } from "../../utils/ipc";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface AppUpgradeModalProps {
    hasNewVersion?: boolean;
}

export const AppUpgradeModal = observer<AppUpgradeModalProps>(function AppUpgradeModal() {
    const globalStore = useContext(GlobalStoreContext);
    const [appVersion, setAppVersion] = useState(" ");
    const [upgradePercent, setUpgradePercent] = useState(0);
    const [showUpgradeProgress, setShowUpgradeProgress] = useState(false);
    const [upgradeFail, setUpgradeFail] = useState(false);
    const sp = useSafePromise();

    useEffect(() => {
        sp(ipcSyncByApp("get-update-info"))
            .then(data => {
                if (data.hasNewVersion) {
                    setAppVersion(data.version);
                }
            })
            .catch(err => {
                console.error("ipc failed", err);
            });

        return () => {
            ipcReceiveRemove("update-progress");
        };
    }, [appVersion, globalStore, sp]);

    const renderModalTitle = (): React.ReactNode => {
        return <div className="app-upgrade-modal-title">版本更新</div>;
    };

    const cancelUpgrade = (): void => {
        setShowUpgradeProgress(false);
        globalStore.hideAppUpgradeModal();
    };

    const upgradeStart = (): void => {
        setShowUpgradeProgress(true);
        sp(ipcSyncByApp("get-update-info"))
            .then(data => {
                if (data.hasNewVersion) {
                    ipcReceive("update-progress", args => {
                        if (args.status) {
                            setUpgradePercent(args.percent);
                        } else {
                            setUpgradeFail(true);
                        }
                    });

                    ipcAsyncByMainWindow("start-update", undefined);
                }
            })
            .catch(err => {
                console.error("ipc failed", err);
            });
    };

    return (
        <Modal
            keyboard={false}
            width={386}
            maskClosable={false}
            title={renderModalTitle()}
            footer={[]}
            visible={globalStore.isShowAppUpgradeModal}
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
                        发现新版本{appVersion}, 请更新到最新版本获取更好的产品体验
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
