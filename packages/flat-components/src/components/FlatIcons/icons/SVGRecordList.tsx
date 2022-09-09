import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGRecordList: React.FC<FlatIconProps> = ({
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
            <circle className="flat-icon-fill-color" cx="19" cy="8" fill="#5D6066" r="1" />
            <circle className="flat-icon-fill-color" cx="19" cy="12" fill="#5D6066" r="1" />
            <circle className="flat-icon-fill-color" cx="19" cy="16" fill="#5D6066" r="1" />
            <path
                className="flat-icon-stroke-color"
                d="M4 8H16"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M4 12H16"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M4 16H16"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGRecordList;
