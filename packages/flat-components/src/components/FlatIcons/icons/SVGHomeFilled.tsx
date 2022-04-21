import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGHomeFilled: React.FC<FlatIconProps> = ({
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
                className="flat-icon-stroke-color flat-icon-fill-color"
                clipRule="evenodd"
                d="m4 9 8-5 8 5h-2v11h-4v-6h-4v6H6V9H4Z"
                fill="#5D6066"
                fillRule="evenodd"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGHomeFilled;
