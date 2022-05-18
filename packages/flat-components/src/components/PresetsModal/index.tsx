import "./style.less";

import React from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";

import { SVGPlus } from "../FlatIcons";

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

export const PresetsModal: React.FC<PresetsModalProps> = ({
    visible,
    images,
    onClick,
    onClose,
}) => {
    const { t } = useTranslation();

    return (
        <Modal
            closable
            destroyOnClose
            footer={null}
            title={t("presets.title")}
            visible={visible}
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
                        <img alt={i18nKey} src={src} title={t(i18nKey)} />
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
