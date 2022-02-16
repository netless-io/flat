import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCirclePlusFilled: React.FC<FlatIconProps> = ({
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
                d="M12 3.375a8.625 8.625 0 1 0 0 17.25 8.625 8.625 0 0 0 0-17.25Zm.625 8H16v1.25h-3.375V16h-1.25v-3.375H8v-1.25h3.375V8h1.25v3.375Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGCirclePlusFilled;
