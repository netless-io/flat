import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGArrowBolded: React.FC<FlatIconProps> = ({
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
                d="M5 19 15.5 8.5"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.75"
            ></path>
            <path
                className="flat-icon-stroke-color flat-icon-fill-color"
                d="m17 12 2-7-7 2 3.5 1.5L17 12Z"
                fill="#5D6066"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGArrowBolded;
