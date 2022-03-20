import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCircleQuestionOutlined: React.FC<FlatIconProps> = ({
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
            <circle
                className="flat-icon-stroke-color"
                cx="12"
                cy="12"
                r="8"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></circle>
            <path
                className="flat-icon-fill-color"
                clipRule="evenodd"
                d="M13.942 7.424a2.746 2.746 0 1 0-3.884 3.884l.884-.884-.103-.113a1.496 1.496 0 1 1 2.22.113l-1.5 1.5-.065.075a.626.626 0 0 0-.119.367v2h1.25l-.001-1.742 1.318-1.316.128-.137a2.746 2.746 0 0 0-.128-3.747ZM12 17.366a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGCircleQuestionOutlined;
