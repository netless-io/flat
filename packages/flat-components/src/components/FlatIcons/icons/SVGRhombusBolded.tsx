import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGRhombusBolded: React.FC<FlatIconProps> = ({
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
                d="M3.515 12 12 3.514 20.485 12 12 20.485z"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.75"
            ></path>
        </svg>
    );
};

export default SVGRhombusBolded;
