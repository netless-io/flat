import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGRestore: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M17 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-fill-color"
                d="m15 10-7.202.464 4.003 6.005L15 10Zm-8.653 6.52 4.32-2.88-.694-1.04-4.32 2.88.694 1.04Z"
                fill="#5D6066"
            />
            <path
                className="flat-icon-stroke-color"
                d="M8 5h11a2 2 0 0 1 2 2v7"
                stroke="#5D6066"
                strokeDasharray="1 1"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGRestore;
