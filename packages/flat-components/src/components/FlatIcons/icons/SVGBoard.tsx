import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGBoard: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M3 19h18"
                stroke="#5D6066"
                strokeWidth="1.255"
            />
            <path
                className="flat-icon-stroke-color"
                d="M11 19v-2H7v2m13.217-9.293a1 1 0 0 1 1.414 0l.663.663a1 1 0 0 1 0 1.414l-4.832 4.831-2.423.347.346-2.423 4.832-4.832Z"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M19.54 10.384c.137.139 1.441 1.443 2.076 2.077"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGBoard;
