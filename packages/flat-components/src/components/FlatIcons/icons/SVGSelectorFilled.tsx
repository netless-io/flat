import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGSelectorFilled: React.FC<FlatIconProps> = ({
    active,
    className = "",
    ...restProps
}) => {
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
                d="M18 11V4H4v14h7"
                stroke="#5D6066"
                strokeDasharray="1.25 1.25"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-stroke-color flat-icon-fill-color"
                d="m15 20-2-7 7 2-3.5 1.5L15 20Z"
                fill="#5D6066"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGSelectorFilled;
