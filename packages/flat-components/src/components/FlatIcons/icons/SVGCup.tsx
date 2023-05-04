import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCup: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M7 19h5m5 0h-5m0 0v-3m0 0a5 5 0 0 1-5-5V5h10v6a5 5 0 0 1-5 5Z"
                stroke="#5D6066"
                strokeWidth="1.255"
            />
            <path
                className="flat-icon-stroke-color"
                d="M5.5 8H3v1a3 3 0 0 0 3 3h1.5m11-4H21v1a3 3 0 0 1-3 3h-1.5"
                stroke="#5D6066"
                strokeWidth="1.255"
            />
        </svg>
    );
};

export default SVGCup;
