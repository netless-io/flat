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
import { useTranslate } from "@netless/flat-i18n";

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
    const t = useTranslate();

    return (
        <>
            <TopBarRightBtn
                icon={<img src={appStoreSVG} />}
                title={t("app-store")}
                onClick={() => setAppStoreIsVisible(true)}
            />
            <Modal
                destroyOnClose
                className="app-store-modal"
                footer={null}
                open={appStoreIsVisible}
                title={
                    <div className="app-store-modal-title-box">
                        <div className="app-store-modal-title">{t("app-store")}</div>
                        <div className="app-store-modal-inner-text">{t("recently-used")}</div>
                    </div>
                }
                onCancel={() => setAppStoreIsVisible(false)}
            >
                <div className="apps-container">
                    {apps.map((config, i) => (
                        <AppButton
                            key={`${config.kind}${i}`}
                            addApp={async () => {
                                await sp(addApp(config));
                                setAppStoreIsVisible(false);
                            }}
                            icon={appIcons[config.kind as keyof typeof appIcons]}
                            kind={config.kind}
                            name={config.options?.title ?? config.kind}
                        />
                    ))}
                </div>
            </Modal>
        </>
    );
});
