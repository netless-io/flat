import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGWhiteboard: React.FC<FlatIconProps> = ({
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
                d="M4 20h16M4 6h16"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <rect
                className="flat-icon-stroke-color"
                height="10"
                rx="1"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
                width="14"
                x="5"
                y="8"
            ></rect>
            <path
                className="flat-icon-stroke-color"
                d="M12 4v2"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGWhiteboard;
