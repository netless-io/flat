import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGShare: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M19 13.364V17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="m16 6 3 3-3 3"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M19 9h-5a2 2 0 0 0-2 2v3"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGShare;
