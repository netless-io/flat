import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGHandUp: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
    return (
        <svg
            className={`${className} flat-icon ${active ? "is-active" : ""}`}
            fill="none"
            height="38"
            viewBox="0 0 38 38"
            width="38"
            xmlns="http://www.w3.org/2000/svg"
            {...restProps}
        >
            <path
                className="flat-icon-stroke-color"
                d="M24.8 19.936a4.5 4.5 0 0 0-3.181 5.512"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.5"
            />
            <path
                className="flat-icon-stroke-color"
                clipRule="evenodd"
                d="m27.101 27.425 3.83-11.323a1.294 1.294 0 0 0-.578-1.535 1.223 1.223 0 0 0-1.574.304l-3.976 5.065-3.105-11.59a1.5 1.5 0 1 0-2.898.776l1.217 7.438-3.442-9.948a1.5 1.5 0 0 0-2.898.777l1.993 10.336-3.054-8.5a1.5 1.5 0 1 0-2.898.777l1.605 8.888-2.277-5.602a1.5 1.5 0 0 0-2.898.777l3.882 14.489a6 6 0 0 0 7.349 4.242l5.591-1.498a6 6 0 0 0 4.131-3.873Z"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.5"
            />
        </svg>
    );
};

export default SVGHandUp;
