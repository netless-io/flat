import { Button } from "antd";
import React, { useMemo, useState } from "react";
import { LoginPlatform } from "@netless/flat-server-api";

import closeSVG from "./icons/close.svg";

// binding phone & email field
interface BindingFieldProps {
    key: string;
    msg: string;
    icon: string;
    desc: string;
    payload: { content: string; type: LoginPlatform };

    handleShowModel: () => void;
    unbind: (content: string, type: LoginPlatform) => Promise<void>;
}

export function BindingField({
    key,
    msg,
    icon,
    desc,
    payload,

    handleShowModel,
    unbind,
}: BindingFieldProps): React.ReactElement {
    const { content, type } = payload;

    const [hovering, setHovering] = useState(false);
    const hasKey = useMemo(() => !!key, [key]);

    return (
        <div
            className={`input-container-bg ${hovering && hasKey ? "input-container-bg-hover" : ""}`}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            <img alt={icon} className="general-setting-item-icon" src={icon} />
            <span className="general-setting-item-icon-desc">{desc}</span>
            {hasKey ? (
                <span className="general-setting-item-key">{key}</span>
            ) : (
                <Button type="link" onClick={handleShowModel}>
                    {msg}
                </Button>
            )}
            {hovering && hasKey && (
                <Button
                    className="general-setting-item-btn"
                    type="link"
                    onClick={() => unbind(content, type)}
                >
                    <img alt="close" src={closeSVG} />
                </Button>
            )}
        </div>
    );
}
