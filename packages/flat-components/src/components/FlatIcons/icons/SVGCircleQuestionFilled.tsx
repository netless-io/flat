import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCircleQuestionFilled: React.FC<FlatIconProps> = ({
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
                d="M3.375 12a8.625 8.625 0 1 1 17.25 0 8.625 8.625 0 0 1-17.25 0Zm6.683-.692a2.746 2.746 0 1 1 4.012-.137l-.128.137-1.318 1.316.001 1.742h-1.25v-2c0-.132.042-.26.119-.367l.064-.075 1.5-1.5a1.496 1.496 0 1 0-2.219-.113l.103.113-.884.884ZM13 16.366a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGCircleQuestionFilled;
