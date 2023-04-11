import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGSun: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
            <circle
                className="flat-icon-stroke-color"
                cx="12"
                cy="12"
                r="5"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M12 3V7"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M12 17V21"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M5.63604 5.63599L8.46447 8.46441"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M15.5355 15.5354L18.364 18.3638"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M2.99995 12H6.99995"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M16.9999 12H20.9999"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M18.364 5.63599L15.5355 8.46441"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M8.46447 15.5354L5.63604 18.3638"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGSun;
