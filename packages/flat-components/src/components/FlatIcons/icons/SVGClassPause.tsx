import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGClassPause: React.FC<FlatIconProps> = ({
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
                className="flat-icon-fill-color"
                clipRule="evenodd"
                d="M18 11h-2v7h2v-7Zm4 0h-2v7h2v-7Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="M20 10V6h-5a3 3 0 0 0-3 3v5-5a3 3 0 0 0-3-3H4v10a1 1 0 0 0 1 1h5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGClassPause;
