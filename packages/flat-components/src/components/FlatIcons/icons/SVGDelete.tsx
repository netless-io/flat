import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGDelete: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M16.375 9v8h1.25V9h-1.25ZM15 18.375H9v1.25h6v-1.25ZM7.625 17V9h-1.25v8h1.25ZM9 18.375c-.76 0-1.375-.616-1.375-1.375h-1.25A2.625 2.625 0 0 0 9 19.625v-1.25ZM16.375 17c0 .76-.616 1.375-1.375 1.375v1.25A2.625 2.625 0 0 0 17.625 17h-1.25ZM11 5.625h2v-1.25h-2v1.25Zm2 0c.76 0 1.375.616 1.375 1.375h1.25A2.625 2.625 0 0 0 13 4.375v1.25ZM9.625 7c0-.76.616-1.375 1.375-1.375v-1.25A2.625 2.625 0 0 0 8.375 7h1.25Z"
                fill="#5D6066"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="M4 7h16"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGDelete;
