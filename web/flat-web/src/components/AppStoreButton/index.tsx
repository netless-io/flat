import "./style.less";

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
];

export const AppStoreButton = observer<AppStoreButtonProps>(function AppStoreButton({ addApp }) {
    const [appStoreIsVisible, setAppStoreIsVisible] = useState(false);
    const sp = useSafePromise();

    return (
        <>
            <Tooltip placement="right" key="apps" title="Apps">
                <div className="apps-button" onClick={() => setAppStoreIsVisible(true)}>
                    <svg focusable="false" width="1em" height="1em" viewBox="0 0 24 24">
                        <path
                            d="M16 20h4v-4h-4m0-2h4v-4h-4m-6-2h4V4h-4m6 4h4V4h-4m-6 10h4v-4h-4m-6 4h4v-4H4m0 10h4v-4H4m6 4h4v-4h-4M4 8h4V4H4v4z"
                            fill="currentColor"
                        ></path>
                    </svg>
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
