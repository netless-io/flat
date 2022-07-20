import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { LoadingOutlined } from "@ant-design/icons";

export interface AppButtonProps {
    kind: string;
    name: string;
    icon: string;
    addApp: () => Promise<void>;
}

export const AppButton = observer<AppButtonProps>(function AppButton({ kind, name, icon, addApp }) {
    const [loading, setLoading] = useState(false);
    const sp = useSafePromise();

    return (
        <>
            <div
                key={kind}
                className="app-box"
                onClick={async () => {
                    setLoading(true);
                    await sp(addApp());
                    setLoading(false);
                }}
            >
                <div className="app-icon-box">
                    <img alt={name} className="app-icon" src={icon} />
                    {loading && (
                        <div className="app-loading-spin">
                            <LoadingOutlined spin />
                        </div>
                    )}
                </div>
                <span className="app-name">{name}</span>
            </div>
        </>
    );
});
