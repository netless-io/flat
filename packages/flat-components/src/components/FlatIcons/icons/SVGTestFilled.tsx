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
                d="M11 16V19"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M8 19H14"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color flat-icon-fill-color"
                clipRule="evenodd"
                d="M3.375 7C3.375 5.55025 4.55025 4.375 6 4.375H15C14.731 4.375 14.4921 4.54714 14.4071 4.80236L13.5495 7.375H11V8.625H14C14.269 8.625 14.5079 8.45286 14.5929 8.19764L15 6.97642L16.4071 11.1976C16.4921 11.4529 16.731 11.625 17 11.625C17.269 11.625 17.5079 11.4529 17.5929 11.1976L18.4505 8.625H18.625V14C18.625 15.4497 17.4497 16.625 16 16.625H6C4.55025 16.625 3.375 15.4497 3.375 14V7ZM18.625 7.375H18C17.731 7.375 17.4921 7.54714 17.4071 7.80236L17 9.02358L15.5929 4.80236C15.5079 4.54714 15.269 4.375 15 4.375H16C17.4497 4.375 18.625 5.55025 18.625 7V7.375Z"
                fill="#5D6066"
                fillRule="evenodd"
            />
        </svg>
    );
};

export default SVGTestFilled;
