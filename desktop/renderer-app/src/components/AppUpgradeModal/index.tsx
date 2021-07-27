import "./index.less";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { ipcAsyncByMainWindow, ipcReceive, ipcReceiveRemove } from "../../utils/ipc";
import { useTranslation } from "react-i18next";
import { update } from "flat-types";

export interface AppUpgradeModalProps {
    updateInfo:
        | (update.UpdateCheckInfo & {
              hasNewVersion: true;
          })
        | null;
    onClose: () => void;
}

export const AppUpgradeModal = observer<AppUpgradeModalProps>(function AppUpgradeModal({
    updateInfo,
    onClose,
}) {
    const { t } = useTranslation();
    const [upgradePercent, setUpgradePercent] = useState(0);
    const [showUpgradeProgress, setShowUpgradeProgress] = useState(false);
    const [upgradeFail, setUpgradeFail] = useState(false);

    useEffect(() => {
        if (showUpgradeProgress && updateInfo !== null) {
            ipcReceive("update-progress", args => {
                if (args.status) {
                    setUpgradePercent(args.percent);
                } else {
                    setUpgradeFail(true);
                }
            });

            ipcAsyncByMainWindow("start-update", {
                prereleaseTag: updateInfo.prereleaseTag,
            });
        }
        return () => {
            ipcReceiveRemove("update-progress");
        };
    }, [showUpgradeProgress, updateInfo]);

    const renderModalTitle = (): React.ReactNode => {
        return <div className="app-upgrade-modal-title">{t("version-updates")}</div>;
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
            visible={updateInfo !== null}
            onCancel={cancelUpgrade}
            wrapClassName="app-upgrade-modal-container"
            closable={false}
        >
            {showUpgradeProgress ? (
                <div>
                    <span className="app-upgrade-modal-font">
                        {t("downloading")} ({upgradePercent.toFixed(2)}%)...
                    </span>
                    <div className="app-upgrade-modal-progress" />
                    <div
                        className="app-upgrade-active-progress"
                        style={{ width: `${upgradePercent}%` }}
                    />
                    {upgradeFail && (
                        <div>
                            <span className="app-upgrade-modal-font">
                                {t("update-failed-tips")}
                            </span>
                            <div className="app-upgrade-modal-btn">
                                <Button type="primary" onClick={() => window.close()}>
                                    {t("confirm")}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <span className="app-upgrade-modal-font">
                        {t("new-version-tips", { version: updateInfo?.version || " " })}
                    </span>
                    <div className="app-upgrade-modal-btn">
                        <Button type="primary" onClick={upgradeStart}>
                            {t("update-now")}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
});
