import "./style.less";

import classNames from "classnames";
import React, { FC, useCallback, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Modal } from "antd";

import {
    SVGCamera,
    SVGGeneral,
    SVGMicrophone,
    SVGSetting,
    SVGShortcut,
    SVGSound,
    TopBarRightBtn,
} from "flat-components";
import { useTranslate } from "@netless/flat-i18n";
import { ClassroomStore } from "@netless/flat-stores";
import { GeneralSettings } from "./GeneralSettings";
import { CameraSettings } from "./CameraSettings";
import { SpeakerSettings } from "./SpeakerSettings";
import { MicrophoneSettings } from "./MicrophoneSettings";
import { ShortcutSettings } from "./ShortcutSettings";

export interface PreferencesButtonProps {
    classroom: ClassroomStore;
}

export const PreferencesButton = observer<PreferencesButtonProps>(function PreferencesModal({
    classroom,
}) {
    const t = useTranslate();
    const [open, setOpen] = useState(false);
    const onToggle = useCallback(() => setOpen(open => !open), []);

    const [index, setIndex] = useState(0);
    const onCancel = useCallback(() => {
        setOpen(false);
        setIndex(0);
    }, []);

    const updateIndex = useCallback((ev: React.MouseEvent) => {
        const el = ev.target as HTMLElement | null;
        const index = el?.dataset?.index;
        if (typeof index === "string") {
            setIndex(+index);
            const section = document.getElementById("preferences-" + index);
            if (section) {
                section.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, []);

    const menu = useMemo<Array<{ icon: FC<{ active?: boolean }>; text: string }>>(
        () => [
            { icon: SVGGeneral, text: t("general-settings") },
            { icon: SVGCamera, text: t("camera-settings") },
            { icon: SVGSound, text: t("speaker-settings") },
            { icon: SVGMicrophone, text: t("microphone-settings") },
            { icon: SVGShortcut, text: t("shortcut-settings") },
        ],
        [t],
    );

    return (
        <>
            <TopBarRightBtn icon={<SVGSetting />} title={t("settings")} onClick={onToggle} />
            <Modal
                centered
                closable
                destroyOnClose
                className="preferences-modal"
                footer={null}
                open={open}
                title={t("nav-settings")}
                width={860}
                onCancel={onCancel}
            >
                <div className="preferences-modal-content" onClick={updateIndex}>
                    <nav className="preferences-modal-nav">
                        <ul>
                            {menu.map(({ icon: Icon, text }, i) => (
                                <li key={i}>
                                    <a
                                        className={classNames("preferences-modal-nav-item", {
                                            "is-active": index === i,
                                        })}
                                        data-index={i}
                                    >
                                        <Icon active={index === i} />
                                        <span>{text}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="preferences-modal-body">
                        <GeneralSettings classroom={classroom} />
                        <hr />
                        <CameraSettings classroom={classroom} />
                        <hr />
                        <SpeakerSettings classroom={classroom} />
                        <hr />
                        <MicrophoneSettings classroom={classroom} />
                        <hr />
                        <ShortcutSettings />
                    </div>
                </div>
            </Modal>
        </>
    );
});
