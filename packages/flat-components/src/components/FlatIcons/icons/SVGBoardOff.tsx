import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGBoardOff: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M7.024 19.628H21v-1.256h-9.375V17a.625.625 0 0 0-.625-.625h-.724l-1.25 1.25h1.349v.747H8.279l-1.255 1.256ZM19.375 7.276V8h1.25V7a2.62 2.62 0 0 0-.136-.837l-1.114 1.113Zm-2.402-2.901H6A2.625 2.625 0 0 0 3.375 7v10h.973l.277-.277V7c0-.76.616-1.375 1.375-1.375h9.723l1.25-1.25Z"
                fill="#5D6066"
                fillRule="evenodd"
            />
            <path
                className="flat-icon-stroke-color"
                d="M4.93 19.071 19.072 4.929m1.145 4.778a1 1 0 0 1 1.414 0l.663.663a1 1 0 0 1 0 1.414l-4.832 4.831-2.423.347.346-2.423 4.832-4.832Z"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M19.54 10.384c.137.139 1.441 1.443 2.076 2.077"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGBoardOff;
