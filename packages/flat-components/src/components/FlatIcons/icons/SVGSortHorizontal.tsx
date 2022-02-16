import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGSortHorizontal: React.FC<FlatIconProps> = ({
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
                d="m10 8-2 2-2 2 2 2 2 2V8Zm4 0 2 2 2 2-2 2-2 2V8Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGSortHorizontal;
