import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGHomeOutlined: React.FC<FlatIconProps> = ({
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
                className="flat-icon-stroke-color"
                d="M3 10L12 5L21 10M19 11V19H14V18C14 16.8954 13.1046 16 12 16V16C10.8954 16 10 16.8954 10 18V19H5V11"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGHomeOutlined;
