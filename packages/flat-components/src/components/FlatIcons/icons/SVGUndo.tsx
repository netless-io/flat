import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGUndo: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                className="flat-icon-fill-color"
                d="M19 9.625H9v-1.25h10v1.25ZM5.625 13v6h-1.25v-6h1.25ZM9 9.625A3.375 3.375 0 0 0 5.625 13h-1.25A4.625 4.625 0 0 1 9 8.375v1.25Z"
                fill="#5D6066"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="m15 5 4 4-4 4"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGUndo;
