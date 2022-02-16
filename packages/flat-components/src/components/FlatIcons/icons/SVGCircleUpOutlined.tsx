import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCircleUpOutlined: React.FC<FlatIconProps> = ({
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
            <circle
                className="flat-icon-stroke-color"
                r="8"
                stroke="#5D6066"
                strokeWidth="1.25"
                transform="matrix(0 1 1 0 12 12)"
            ></circle>
            <path
                className="flat-icon-stroke-color"
                d="m16 14-2-2-2-2-2 2-2 2"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGCircleUpOutlined;
