import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCircleRightFilled: React.FC<FlatIconProps> = ({
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
                d="M20.625 12a8.625 8.625 0 1 0-17.25 0 8.625 8.625 0 0 0 17.25 0ZM9.558 8.442l.884-.884 4 4 .072.087a.625.625 0 0 1-.072.797l-4 4-.884-.884L13.117 12 9.558 8.442Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGCircleRightFilled;
