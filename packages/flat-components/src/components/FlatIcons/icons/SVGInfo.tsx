import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGInfo: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
            <circle className="flat-icon-fill-color" cx="12" cy="6" fill="#5D6066" r="1"></circle>
            <path
                className="flat-icon-stroke-color"
                d="M12 19V9"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGInfo;
