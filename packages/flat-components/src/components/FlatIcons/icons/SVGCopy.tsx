import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCopy: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="m9 20-.442.442a.625.625 0 0 0 .442.183V20Zm-4-4h-.625c0 .166.066.325.183.442L5 16ZM17 6h.625A.625.625 0 0 0 17 5.375V6Zm-2 13.375H9v1.25h6v-1.25Zm-5.558.183-4-4-.884.884 4 4 .884-.884ZM5.625 16V8h-1.25v8h1.25ZM7 6.625h10v-1.25H7v1.25ZM16.375 6v12h1.25V6h-1.25ZM5.625 8c0-.76.616-1.375 1.375-1.375v-1.25A2.625 2.625 0 0 0 4.375 8h1.25ZM15 20.625A2.625 2.625 0 0 0 17.625 18h-1.25c0 .76-.616 1.375-1.375 1.375v1.25Z"
                fill="#5D6066"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="M5 16h4v4"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-fill-color"
                d="M19.625 18V6h-1.25v12h1.25ZM17 3.375H7v1.25h10v-1.25ZM19.625 6A2.625 2.625 0 0 0 17 3.375v1.25c.76 0 1.375.616 1.375 1.375h1.25Z"
                fill="#5D6066"
            ></path>
        </svg>
    );
};

export default SVGCopy;
