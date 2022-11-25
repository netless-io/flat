import "./index.less";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";

import { update } from "flat-types";
import { useTranslate } from "@netless/flat-i18n";

import { useSafePromise } from "../../utils/hooks/lifecycle";
import { AutoUpdateContext, RuntimeContext } from "../StoreProvider";

export type UpdateInfo = update.UpdateCheckInfo & {
    hasNewVersion: true;
};

export interface AutoUpdateState {
    checkUpdate: () => void;
    updateInfo: UpdateInfo | null;
    setUpdateInfo: (info: UpdateInfo | null) => void;
    loading: boolean;
    percent: number;
    isStarted: boolean;
    isFailed: boolean;
    startUpdate: () => void;
    cancelUpdate: () => void;
}

export function useAutoUpdate(): AutoUpdateState {
    const sp = useSafePromise();
    const runtime = useContext(RuntimeContext);
    const autoUpdate = useContext(AutoUpdateContext);

    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const [percent, setPercent] = useState(0);
    const [isStarted, start] = useState(false);
    const [isFailed, fail] = useState(false);

    const startUpdate = useCallback(() => start(true), []);
    const cancelUpdate = useCallback(() => start(false), []);

    const checkUpdate = useCallback(async () => {
        if (autoUpdate && runtime) {
            setLoading(true);
            try {
                const e = await sp(autoUpdate.getUpdateInfo());
                setLoading(false);
                if (!e || !e.hasNewVersion || e.version === runtime.appVersion) {
                    console.log("[Auto Updater] No new version");
                } else {
                    console.log("[Auto Updater] New version found", e);
                    setUpdateInfo(e);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, [autoUpdate, runtime, sp]);

    useEffect(() => {
        if (autoUpdate && isStarted && updateInfo) {
            const stopListenProgress = autoUpdate.onUpdateProgress(e => {
                if (e.status) {
                    setPercent(e.percent);
                } else {
                    fail(true);
                }
            });
            autoUpdate.startUpdate(updateInfo.prereleaseTag);
            return stopListenProgress;
        }
        return;
    }, [autoUpdate, isStarted, updateInfo]);

    return {
        checkUpdate,
        updateInfo,
        setUpdateInfo,
        loading,
        percent,
        isStarted,
        isFailed,
        startUpdate,
        cancelUpdate,
    };
}

export const AppUpgradeModal = observer(function AppUpgradeModal() {
    const t = useTranslate();
    const {
        checkUpdate,
        updateInfo,
        setUpdateInfo,
        percent,
        isStarted,
        isFailed,
        startUpdate,
        cancelUpdate,
    } = useAutoUpdate();

    useEffect(() => {
        checkUpdate();
    }, [checkUpdate]);

    const onCancel = useCallback(() => {
        cancelUpdate();
        setUpdateInfo(null);
    }, [cancelUpdate, setUpdateInfo]);

    return (
        <Modal
            closable={false}
            footer={[]}
            keyboard={false}
            maskClosable={false}
            open={updateInfo !== null}
            title={<div className="app-upgrade-modal-title">{t("version-updates")}</div>}
            width={386}
            wrapClassName="app-upgrade-modal-container"
            onCancel={onCancel}
        >
            {isStarted ? (
                <div>
                    <span className="app-upgrade-modal-font">
                        {t("downloading")} ({percent.toFixed(2)}%)...
                    </span>
                    <div className="app-upgrade-modal-progress" />
                    <div className="app-upgrade-active-progress" style={{ width: `${percent}%` }} />
                    {isFailed && (
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
                        <Button type="primary" onClick={startUpdate}>
                            {t("update-now")}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
});
