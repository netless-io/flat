import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGRecordStop: React.FC<FlatIconProps> = ({
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
                d="M3 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <circle
                className="flat-icon-stroke-color"
                cx="6"
                cy="15"
                r="3"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></circle>
            <path className="flat-icon-fill-color" d="M5 14h2v2H5z" fill="#5D6066"></path>
            <path
                className="flat-icon-stroke-color"
                clipRule="evenodd"
                d="m17 11 4-2v6l-4-2v-2Z"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="M6 9h4"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGRecordStop;
