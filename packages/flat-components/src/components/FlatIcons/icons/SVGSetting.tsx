import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGSetting: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                clipRule="evenodd"
                d="M11.5 4.289a1 1 0 0 1 1 0l5.928 3.422a1 1 0 0 1 .5.866v6.846a1 1 0 0 1-.5.866L12.5 19.71a1 1 0 0 1-1 0l-5.928-3.42a1 1 0 0 1-.5-.866V8.577a1 1 0 0 1 .5-.866L11.5 4.29Z"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <circle
                className="flat-icon-stroke-color"
                cx="12"
                cy="12"
                r="2"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></circle>
        </svg>
    );
};

export default SVGSetting;
