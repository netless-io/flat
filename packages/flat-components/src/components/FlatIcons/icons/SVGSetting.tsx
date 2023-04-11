import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGSetting: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                clipRule="evenodd"
                d="M11.5 4.28868C11.8094 4.11004 12.1906 4.11004 12.5 4.28868L18.4282 7.71132C18.7376 7.88996 18.9282 8.22008 18.9282 8.57735V15.4226C18.9282 15.7799 18.7376 16.11 18.4282 16.2887L12.5 19.7113C12.1906 19.89 11.8094 19.89 11.5 19.7113L5.5718 16.2887C5.2624 16.11 5.0718 15.7799 5.0718 15.4226V8.57735C5.0718 8.22008 5.2624 7.88996 5.5718 7.71132L11.5 4.28868Z"
                fillRule="evenodd"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <circle
                className="flat-icon-stroke-color"
                cx="12"
                cy="12"
                r="2"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGSetting;
