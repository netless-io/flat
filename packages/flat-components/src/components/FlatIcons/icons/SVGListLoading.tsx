import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGListLoading: React.FC<FlatIconProps> = ({
    active,
    className = "",
    ...restProps
}) => {
    return (
        <svg
            className={`${className} flat-icon ${active ? "is-active" : ""}`}
            fill="none"
            height="50"
            viewBox="0 0 50 50"
            width="50"
            xmlns="http://www.w3.org/2000/svg"
            {...restProps}
        >
            <rect height="50" width="50" />
            <circle cx="13" cy="25" fill="#3381FF" r="2" />
            <circle cx="25" cy="25" fill="#3381FF" r="4" />
            <circle cx="37" cy="25" fill="#3381FF" r="2" />
        </svg>
    );
};

export default SVGListLoading;
