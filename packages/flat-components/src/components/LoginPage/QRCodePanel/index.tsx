import "./index.less";

import { Button } from "antd";
import React from "react";
import { useTranslate } from "@netless/flat-i18n";

export interface QRCodePanelProps {
    renderQRCode: () => React.ReactNode;
    backToLogin: () => void;
}

export const QRCodePanel: React.FC<QRCodePanelProps> = ({ renderQRCode, backToLogin }) => {
    const t = useTranslate();
    return (
        <div className="login-with-wechat">
            <div className="login-width-limiter">
                <div className="login-qrcode">{renderQRCode()}</div>
                <Button className="login-btn-back" type="link" onClick={backToLogin}>
                    {t("back")}
                </Button>
            </div>
        </div>
    );
};
