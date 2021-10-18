import "./style.less";
import appStoreSVG from "../../assets/image/app-store.svg";

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Modal, Tooltip } from "antd";

import { AddAppParams } from "@netless/window-manager";
import { useSafePromise } from "flat-components";
import { AppButton } from "./AppButton";

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
            title: "IframeBridge",
        },
        attributes: {
            src: "https://demo-edu.cocos.com/agora-demo/index.html",
        },
    },
];

export const AppStoreButton = observer<AppStoreButtonProps>(function AppStoreButton({ addApp }) {
    const [appStoreIsVisible, setAppStoreIsVisible] = useState(false);
    const sp = useSafePromise();

    return (
        <>
            <Tooltip placement="right" key="apps" title="Apps">
                <div className="apps-button" onClick={() => setAppStoreIsVisible(true)}>
                    <img src={appStoreSVG} alt="app store" />
                </div>
            </Tooltip>
            <Modal
                visible={appStoreIsVisible}
                footer={null}
                onCancel={() => setAppStoreIsVisible(false)}
                title="App Store"
                destroyOnClose
            >
                {apps.map((config, i) => (
                    <AppButton
                        key={`${config.kind}${i}`}
                        kind={config.kind}
                        name={config.options?.title ?? config.kind}
                        addApp={async () => {
                            await sp(addApp(config));
                            setAppStoreIsVisible(false);
                        }}
                    />
                ))}
            </Modal>
        </>
    );
});
