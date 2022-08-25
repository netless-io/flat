import React, { useEffect, useRef } from "react";
import { useSafePromise } from "../../utils/hooks";

export interface ThumbnailProps {
    image: string;
    width: number;
    height: number;
}

// helper component to convert a big image into small canvas
export const Thumbnail = /* @__PURE__ */ React.memo<ThumbnailProps>(function Thumbnail(props) {
    const sp = useSafePromise();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        sp(loadImage(props.image))
            .then(image => {
                const canvas = canvasRef.current;
                if (canvas) {
                    drawThumbnail(canvas, image, props.width, props.height);
                }
            })
            .catch(console.error);
    }, [props.height, props.image, props.width, sp]);

    return <canvas ref={canvasRef} />;
});

function drawThumbnail(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    width: number,
    height: number,
): void {
    // note: code below also clears canvas so we don't need to call clearRect()
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context) {
        // draw image with keeping ratio
        const ratio = image.width / image.height;
        if (ratio > 1) {
            const dh = height / ratio;
            context.drawImage(image, 0, (height - dh) / 2, width, dh);
        } else {
            const dw = width * ratio;
            context.drawImage(image, (width - dw) / 2, 0, dw, height);
        }
    }
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}
