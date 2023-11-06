import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGChevronDown: React.FC<FlatIconProps> = ({
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
                d="M16 10L14 12L12 14L10 12L8 10"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGChevronDown;
