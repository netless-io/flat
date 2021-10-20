import "./style.less";
import appStoreSVG from "../../assets/image/app-store.svg";
import codeEditorSVG from "../../assets/image/code-editor.svg";
import countdownSVG from "../../assets/image/countdown.svg";
import geogebraSVG from "../../assets/image/geogebra.svg";
import cocosSVG from "../../assets/image/cocos.svg";

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Modal } from "antd";

import { AddAppParams } from "@netless/window-manager";
import { TopBarRightBtn, useSafePromise } from "flat-components";
import { AppButton } from "./AppButton";
import { useTranslation } from "react-i18next";

export interface AppStoreButtonProps {
    addApp: (config: AddAppParams) => Promise<void>;
}

const apps: AddAppParams[] = [
    {
        kind: "Monaco",
        options: {
            title: "Code Editor",
        },
    },
    {
        kind: "Countdown",
        options: {
            title: "Countdown",
        },
    },
    {
        kind: "GeoGebra",
        options: {
            title: "GeoGebra",
        },
    },
    {
        kind: "IframeBridge",
        options: {
            title: "Cocos",
        },
        attributes: {
            src: "https://demo-edu.cocos.com/agora-demo/index.html",
        },
    },
];

export const appIcons = {
    Monaco: codeEditorSVG,
    Countdown: countdownSVG,
    GeoGebra: geogebraSVG,
    IframeBridge: cocosSVG,
};

export const AppStoreButton = observer<AppStoreButtonProps>(function AppStoreButton({ addApp }) {
    const [appStoreIsVisible, setAppStoreIsVisible] = useState(false);
    const sp = useSafePromise();
    const { t } = useTranslation();

    return (
        <>
            <TopBarRightBtn
                title="Open App Store"
                icon={<img src={appStoreSVG} />}
                onClick={() => setAppStoreIsVisible(true)}
            />
            <Modal
                className="app-store-modal"
                visible={appStoreIsVisible}
                footer={null}
                onCancel={() => setAppStoreIsVisible(false)}
                title={
                    <div className="app-store-modal-title-box">
                        <div className="app-store-modal-title">{t("app-store")}</div>
                        <div className="app-store-modal-inner-text">{t("recently-used")}</div>
                    </div>
                }
                destroyOnClose
            >
                <div className="apps-container">
                    {apps.map((config, i) => (
                        <AppButton
                            key={`${config.kind}${i}`}
                            kind={config.kind}
                            name={config.options?.title ?? config.kind}
                            icon={appIcons[config.kind as keyof typeof appIcons]}
                            addApp={async () => {
                                await sp(addApp(config));
                                setAppStoreIsVisible(false);
                            }}
                        />
                    ))}
                </div>
            </Modal>
        </>
    );
});
