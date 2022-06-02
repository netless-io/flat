import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGTestFilled: React.FC<FlatIconProps> = ({
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
                d="M12 16V19"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color flat-icon-fill-color"
                clipRule="evenodd"
                d="M7 4.375C5.55025 4.375 4.375 5.55025 4.375 7V14C4.375 15.4497 5.55025 16.625 7 16.625H17C18.4497 16.625 19.625 15.4497 19.625 14V7C19.625 5.55025 18.4497 4.375 17 4.375H7Z"
                fill="#5D6066"
                fillRule="evenodd"
            />
            <path
                className="flat-icon-stroke-color"
                d="M9 19H15"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGTestFilled;
