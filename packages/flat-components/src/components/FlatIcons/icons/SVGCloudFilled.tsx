import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCloudFilled: React.FC<FlatIconProps> = ({
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
                d="M10 6c1.382 0 2.6.7 3.318 1.765a3.5 3.5 0 0 1 5.591 3.53A3.5 3.5 0 0 1 17.5 18l-10.499.001a4 4 0 0 1-.997-7.875L6 10a4 4 0 0 1 4-4Z"
                fill="#5D6066"
                fillRule="evenodd"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGCloudFilled;
