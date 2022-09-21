import "./style.less";

import React from "react";
import { Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";

import { SVGPlus } from "../FlatIcons";
import { Thumbnail } from "./Thumbnail";

export interface PresetImage {
    src: string;
    i18nKey: string;
}

export interface PresetsModalProps {
    visible: boolean;
    images: PresetImage[];
    onClick: (image: string) => void;
    onClose: () => void;
}

const ThumbnailWidth = 280;
const ThumbnailHeight = 200;

export const PresetsModal: React.FC<PresetsModalProps> = ({
    visible,
    images,
    onClick,
    onClose,
}) => {
    const t = useTranslate();

    return (
        <Modal
            closable
            footer={null}
            open={visible}
            title={t("presets.title")}
            width={640}
            wrapClassName="presets-modal-container"
            onCancel={onClose}
        >
            {images.map(({ src, i18nKey }) => (
                <div key={i18nKey} className="presets-modal-item">
                    <button
                        className="presets-modal-btn"
                        title={t(i18nKey)}
                        onClick={() => onClick(src)}
                    >
                        <Thumbnail height={ThumbnailHeight} image={src} width={ThumbnailWidth} />
                        <div className="presets-modal-mask">
                            <SVGPlus />
                        </div>
                    </button>
                    <div className="presets-modal-text">{t(i18nKey)}</div>
                </div>
            ))}
        </Modal>
    );
};
