import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCircleInfoFilled: React.FC<FlatIconProps> = ({
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
                d="M3.375 12a8.625 8.625 0 1 1 17.25 0 8.625 8.625 0 0 1-17.25 0ZM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.375 3v6h-1.25v-6h1.25Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGCircleInfoFilled;
