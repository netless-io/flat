import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGLoop: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M6.173 13.83A4 4 0 0 1 9 7h6l-2-2m4.827 5.17A4 4 0 0 1 15 17H9l2 2"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="m10.5 11 2-2v6"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGLoop;
