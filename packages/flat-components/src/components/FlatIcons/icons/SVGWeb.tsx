import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGWeb: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
    return (
        <svg
            className={`${className} flat-icon ${active ? "is-active" : ""}`}
            fill="none"
            height="18"
            viewBox="0 0 18 18"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
            {...restProps}
        >
            <circle
                className="flat-icon-stroke-color"
                cx="9"
                cy="9"
                r="6"
                stroke="#5D6066"
                strokeLinejoin="round"
            />
            <path className="flat-icon-stroke-color" d="M3 9H15M9 3V15" stroke="#5D6066" />
            <path
                className="flat-icon-stroke-color"
                d="M9 3L8.65686 3.34314C5.53266 6.46734 5.53266 11.5327 8.65686 14.6569L9 15"
                stroke="#5D6066"
            />
            <path
                className="flat-icon-stroke-color"
                d="M9 3L9.34314 3.34314C12.4673 6.46734 12.4673 11.5327 9.34314 14.6569L9 15"
                stroke="#5D6066"
            />
        </svg>
    );
};

export default SVGWeb;
