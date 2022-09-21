import "./style.less";
import downloadSVG from "./icons/download.svg";

import classNames from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { Modal, message, Spin } from "antd";

import { useSafePromise } from "../../utils/hooks";
import { LoadingOutlined } from "@ant-design/icons";

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
    images: Array<Promise<HTMLCanvasElement | null>>;
}

export const SaveAnnotationModal: React.FC<SaveAnnotationModalProps> = ({
    visible,
    onClose,
    images,
}) => {
    const t = useTranslate();

    return (
        <Modal
            closable
            destroyOnClose
            footer={null}
            open={visible}
            title={t("annotation.save-action")}
            width={640}
            wrapClassName="save-annotation-modal-container"
            onCancel={onClose}
        >
            {images.map((image, index) => (
                <Annotation
                    key={index}
                    failText={t("annotation.save-failed")}
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

const Annotation = /* @__PURE__ */ React.memo(function Annotation({
    image,
    filename = "annotation.png",
    footerText,
    failText = "Save image failed",
}: AnnotationProps) {
    const sp = useSafePromise();
    const t = useTranslate();
    const ref = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

    useEffect(() => {
        sp(image).then(canvas => {
            setCanvas(canvas);
            setLoading(false);
        });
    }, [image, sp]);

    useEffect(() => {
        const div = ref.current;
        if (!div) {
            return;
        }
        if (canvas) {
            div.appendChild(canvas);
        } else if (div.firstChild) {
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
            title={t("save")}
            onClick={downloadImage}
        >
            {loading && (
                <div className="save-annotation-loader">
                    <Spin indicator={<LoadingOutlined spin />} size="large" />
                </div>
            )}
            <div ref={ref} className="save-annotation-image" />
            <div className="save-annotation-mask" />
            <div className="save-annotation-actions">
                <img alt="download" src={downloadSVG} title={t("save")} />
            </div>
            <div className="save-annotation-footer">{footerText}</div>
        </div>
    );
});
