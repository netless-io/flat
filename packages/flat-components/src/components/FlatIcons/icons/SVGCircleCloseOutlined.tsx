import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCircleCloseOutlined: React.FC<FlatIconProps> = ({
    active,
    className = "",
    ...restProps
}) => {
    return (
        <svg
            className={`${className} flat-icon ${active && "is-active"}`}
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            {...restProps}
        >
            <circle
                className="flat-icon-stroke-color"
                cx="12"
                cy="12"
                r="8"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></circle>
            <path
                className="flat-icon-stroke-color"
                d="m9 15 6-6M9 9l6 6"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGCircleCloseOutlined;
