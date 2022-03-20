import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGMicrophone: React.FC<FlatIconProps> = ({
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
            <rect
                className="flat-icon-stroke-color"
                height="14"
                rx="4"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
                width="8"
                x="8"
                y="4"
            ></rect>
            <path
                className="flat-icon-stroke-color"
                d="M8 8h2m-2 2h2m-2 2h2m4-4h2m-2 2h2m-2 2h2"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-fill-color"
                d="M4 16.625h2v-1.25H4v1.25Zm6 4h4v-1.25h-4v1.25Zm8-4h2v-1.25h-2v1.25Zm-4 4A4.625 4.625 0 0 0 18.625 16h-1.25A3.375 3.375 0 0 1 14 19.375v1.25ZM5.375 16A4.625 4.625 0 0 0 10 20.625v-1.25A3.375 3.375 0 0 1 6.625 16h-1.25Z"
                fill="#5D6066"
            ></path>
        </svg>
    );
};

export default SVGMicrophone;
