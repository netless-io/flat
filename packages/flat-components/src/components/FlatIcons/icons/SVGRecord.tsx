import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGRecord: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
            <rect
                className="flat-icon-stroke-color"
                height="12"
                rx="2"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
                width="14"
                x="3"
                y="6"
            ></rect>
            <path
                className="flat-icon-stroke-color"
                clipRule="evenodd"
                d="m17 11 4-2v6l-4-2v-2Z"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="M6 9h4"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGRecord;
