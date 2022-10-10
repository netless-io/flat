import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCode: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M10 7L5 12L10 17"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M15 7L20 12L15 17"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M11 18L14 6"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGCode;
