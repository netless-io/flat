import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGTest: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                className="flat-icon-stroke-color"
                d="M9 19H15"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-fill-color"
                d="M18.375 13V14H19.625V13H18.375ZM17 15.375H7V16.625H17V15.375ZM5.625 14V7H4.375V14H5.625ZM7 5.625H12V4.375H7V5.625ZM5.625 7C5.625 6.24061 6.24061 5.625 7 5.625V4.375C5.55025 4.375 4.375 5.55025 4.375 7H5.625ZM7 15.375C6.24061 15.375 5.625 14.7594 5.625 14H4.375C4.375 15.4497 5.55025 16.625 7 16.625V15.375ZM18.375 14C18.375 14.7594 17.7594 15.375 17 15.375V16.625C18.4497 16.625 19.625 15.4497 19.625 14H18.375Z"
                fill="#5D6066"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="M12 8H15L16 5L18 11L19 8H21"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGTest;
