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
                d="M12 5L3 10H5V19H10V18C10 16.8954 10.8954 16 12 16C13.1046 16 14 16.8954 14 18V19H19V10H21L12 5Z"
                fill="#5D6066"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGHomeFilled;
