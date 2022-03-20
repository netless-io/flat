import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGEraserFilled: React.FC<FlatIconProps> = ({
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
                d="M13.414 4.929a2 2 0 0 1 2.829 0l2.828 2.828a2 2 0 0 1 0 2.829L12 17.656a4 4 0 0 1-5.657 0L4.93 16.244a2 2 0 0 1 0-2.829l8.485-8.485Z"
                fill="#5D6066"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                d="M12 6.343 17.657 12"
                stroke="#fff"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGEraserFilled;
