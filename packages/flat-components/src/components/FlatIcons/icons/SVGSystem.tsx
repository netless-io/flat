import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGSystem: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M7 4v16m5-16v16m5-16v16"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <circle
                className="flat-icon-stroke-color"
                cx="7"
                cy="11"
                fill="#5D6066"
                r="1"
                stroke="#5D6066"
            ></circle>
            <circle
                className="flat-icon-stroke-color"
                cx="12"
                cy="14"
                fill="#5D6066"
                r="1"
                stroke="#5D6066"
            ></circle>
            <circle
                className="flat-icon-stroke-color"
                cx="17"
                cy="9"
                fill="#5D6066"
                r="1"
                stroke="#5D6066"
            ></circle>
        </svg>
    );
};

export default SVGSystem;
