import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGText: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M6 7V5h5m7 2V5h-5M8 19h3m5 0h-3m-2 0V5m0 14h2M11 5h2m0 0v14"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGText;
