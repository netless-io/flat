import logoSVG from "./icons/logo-sm.svg";

import React from "react";
import { useTranslation } from "react-i18next";

export interface JoinPageMobileProps {
    joinRoom: () => void;
}

export default function JoinPageMobile({ joinRoom }: JoinPageMobileProps): React.ReactElement {
    const { t } = useTranslation();

    return (
        <div className="join-page-mobile-container">
            <div className="join-page-mobile-effect"></div>
            <div className="join-page-mobile-header">
                <img src={logoSVG} alt="flat-logo" />
                <div className="join-page-mobile-logo-texts">
                    <span className="join-page-mobile-logo-text">FLAT</span>
                    <span className="join-page-mobile-logo-text-second">powered by Agora</span>
                </div>
            </div>
            <div className="join-page-mobile-card-wrapper">
                <div className="join-page-mobile-card">
                    <strong className="join-page-mobile-card-title">XXX 创建的房间</strong>
                    <div className="join-page-mobile-card-desc">
                        {t("invite-suffix", { uuid: "123 456 7890" })}
                    </div>
                    <button className="join-page-mobile-btn" onClick={joinRoom}>
                        {t("join-room")}
                    </button>
                </div>
            </div>
            <div className="join-page-mobile-divider">
                <span>{t("or")}</span>
            </div>
            <div className="join-page-mobile-download-flat">
                <span>{t("not-installed-flat-tips")}</span>
                <a href="https://flat.whiteboard.agora.io/#download">{t("download-now")}</a>
            </div>
        </div>
    );
}
