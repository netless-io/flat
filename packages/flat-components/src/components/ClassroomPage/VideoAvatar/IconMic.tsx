import React, { useEffect, useState } from "react";

export interface IconMicProps
    extends Pick<React.SVGProps<SVGSVGElement>, "className" | "style" | "width" | "height"> {
    /** 0~1 */
    getVolumeLevel?: () => number;
    /** 0~1 */
    noise?: number;
}

export const IconMic = /* @__PURE__ */ React.memo<IconMicProps>(function IconMic({
    getVolumeLevel,
    noise = 0.075,
    ...restProps
}) {
    noise = Math.max(0, Math.min(1, noise));

    const vHeight = 14;
    const vWidth = 8;
    const vBaseX = 8;
    const vBaseY = 4;

    const [baseVolumeLevel, setBaseVolumeLevel] = useState(0);
    const [volumeLevel, setVolumeLevel] = useState(0);

    useEffect(() => {
        if (!getVolumeLevel) {
            setBaseVolumeLevel(0);
            return;
        }

        const safeSetVolumeLevel = (): void => {
            setBaseVolumeLevel(Math.max(0, Math.min(1, getVolumeLevel())));
        };

        safeSetVolumeLevel();
        const ticket = setInterval(safeSetVolumeLevel, 500);

        return () => clearInterval(ticket);
    }, [getVolumeLevel]);

    useEffect(() => {
        if (!baseVolumeLevel) {
            return;
        }

        const ticket = setInterval(() => {
            setVolumeLevel(
                baseVolumeLevel + Math.random() * noise * (Math.random() > 0.5 ? 1 : -1),
            );
        }, 50);

        return () => clearInterval(ticket);
    }, [baseVolumeLevel, noise]);

    return (
        <svg
            className="flat-icon"
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            {...restProps}
        >
            <defs>
                <clipPath id="icon-mic-v-clip">
                    <rect height={vHeight} rx={vWidth / 2} width={vWidth} x={vBaseX} y={vBaseY} />
                </clipPath>
            </defs>
            <path d="M0 0h24v24H0z" fill="#999CA3" opacity=".01" />
            <rect
                clipPath="url(#icon-mic-v-clip)"
                fill="#fff"
                height={vHeight}
                width={vWidth}
                x={vBaseX}
                y={vBaseY}
            />
            <path
                d="M4 16.625h2v-1.25H4v1.25Zm6 4h4v-1.25h-4v1.25Zm8-4h2v-1.25h-2v1.25Zm-4 4A4.625 4.625 0 0 0 18.625 16h-1.25A3.375 3.375 0 0 1 14 19.375v1.25ZM5.375 16A4.625 4.625 0 0 0 10 20.625v-1.25A3.375 3.375 0 0 1 6.625 16h-1.25Z"
                fill="#fff"
            />
            <g clipPath="url(#icon-mic-v-clip)">
                <rect
                    fill="#44AD00"
                    height={vHeight * 2}
                    style={{
                        transform: `translateY(${(1 - volumeLevel) * vHeight}px)`,
                        transition: "transform .1s",
                    }}
                    width={vWidth}
                    x={vBaseX}
                    y={vBaseY}
                />
            </g>
        </svg>
    );
});
