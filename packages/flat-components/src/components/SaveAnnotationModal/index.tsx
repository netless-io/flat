import "./style.less";

import pLimit from "p-limit";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, message } from "antd";

function download(
    canvas: HTMLCanvasElement,
    filename = "annotation.png",
    failText = "Save image failed",
): void {
    try {
        const a = document.createElement("a");
        a.download = filename;
        a.href = canvas.toDataURL();
        a.click();
    } catch (err) {
        console.error(err);
        message.error(failText);
    }
}

export interface SaveAnnotationModalProps {
    visible: boolean;
    onClose: () => void;
    images: Array<() => Promise<HTMLCanvasElement | null>>;
}

export const SaveAnnotationModal: React.FC<SaveAnnotationModalProps> = ({
    visible,
    onClose,
    images,
}) => {
    const { t } = useTranslation();

    const params = useMemo(() => {
        const limit = pLimit(1);
        return images.map(image => limit(image));
    }, [images]);

    return (
        <Modal
            closable
            destroyOnClose
            footer={null}
            title={t("save-annotation")}
            visible={visible}
            width={640}
            wrapClassName="save-annotation-modal-container"
            onCancel={onClose}
        >
            {params.map((image, index) => (
                <Annotation
                    key={index}
                    failText={t("save-annotation-failed")}
                    filename={`annotation-${index + 1}.png`}
                    footerText={String(index + 1)}
                    image={image}
                />
            ))}
        </Modal>
    );
};

interface AnnotationProps {
    image: Promise<HTMLCanvasElement | null>;
    filename?: string;
    footerText?: string;
    failText?: string;
}

const Annotation = React.memo(function Annotation({
    image,
    filename = "annotation.png",
    footerText,
    failText = "Save image failed",
}: AnnotationProps) {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

    useEffect(() => {
        let isMounted = true;

        image.then(canvas => {
            isMounted && setCanvas(canvas);
        });

        return () => {
            isMounted = false;
        };
    }, [image]);

    useEffect(() => {
        const div = ref.current;
        if (div && canvas) {
            div.appendChild(canvas);
        } else if (div && div.firstChild) {
            div.removeChild(div.firstChild);
        }
    }, [canvas]);

    const downloadImage = useCallback(() => {
        if (canvas) {
            download(canvas, filename, failText);
        }
    }, [canvas, failText, filename]);

    return (
        <div
            className={classNames("save-annotation", {
                "is-loading": !canvas,
            })}
            onClick={downloadImage}
        >
            <div ref={ref} className="save-annotation-image" />
            <div className="save-annotation-actions">
                <span className="save-annotation-text">{t("save")}</span>
            </div>
            <div className="save-annotation-footer">{footerText}</div>
        </div>
    );
});
