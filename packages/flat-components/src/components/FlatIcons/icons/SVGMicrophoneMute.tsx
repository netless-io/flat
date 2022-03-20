import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGMicrophoneMute: React.FC<FlatIconProps> = ({
    active,
    className = "",
    ...restProps
}) => {
    return (
        <svg
            className={`${className} flat-icon ${active ? "is-active" : ""}`}
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            {...restProps}
        >
            <path
                className="flat-icon-stroke-color"
                d="m5 5 14 14"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-fill-color"
                clipRule="evenodd"
                d="M19.277 16.625H20v-1.25h-1.973l1.25 1.25Zm-3.239 2.065.89.89a4.602 4.602 0 0 1-2.716 1.04l-.212.005h-4a4.626 4.626 0 0 1-4.55-3.787l-.033-.213H4v-1.25h2c.345 0 .625.28.625.625a3.375 3.375 0 0 0 3.19 3.37l.185.005h4a3.36 3.36 0 0 0 2.038-.685Zm.587-4.717V8a4.625 4.625 0 0 0-8.5-2.526l.911.91a3.374 3.374 0 0 1 6.281.991H14v1.25h1.375v.75H14v1.25h1.375v.75h-1.348l1.25 1.25h.098v.098l1.25 1.25Zm-2.587 2.717.89.89A4.625 4.625 0 0 1 7.375 14v-3.973l1.25 1.25v.098h.098l1.25 1.25H8.625V14a3.375 3.375 0 0 0 5.413 2.69Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGMicrophoneMute;
