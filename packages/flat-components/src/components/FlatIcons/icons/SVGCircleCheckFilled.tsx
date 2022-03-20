import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCircleCheckFilled: React.FC<FlatIconProps> = ({
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
                d="M3.375 12a8.625 8.625 0 1 1 17.25 0 8.625 8.625 0 0 1-17.25 0Zm13.067-2.058-.884-.884L11 13.617l-2.558-2.559-.884.884 3 3 .087.072c.243.169.58.145.797-.072l5-5Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGCircleCheckFilled;
