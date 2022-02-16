import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGChat: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M9 16h.625v-.625H9V16Zm0 3h-.625v1.509l1.067-1.067L9 19Zm3-3v-.625h-.259l-.183.183L12 16ZM5.625 7c0-.76.616-1.375 1.375-1.375v-1.25A2.625 2.625 0 0 0 4.375 7h1.25Zm0 7V7h-1.25v7h1.25ZM7 15.375c-.76 0-1.375-.616-1.375-1.375h-1.25A2.625 2.625 0 0 0 7 16.625v-1.25Zm2 0H7v1.25h2v-1.25ZM8.375 16v3h1.25v-3h-1.25Zm1.067 3.442 3-3-.884-.884-3 3 .884.884ZM17 15.375h-5v1.25h5v-1.25ZM18.375 14c0 .76-.616 1.375-1.375 1.375v1.25A2.625 2.625 0 0 0 19.625 14h-1.25Zm0-7v7h1.25V7h-1.25ZM17 5.625c.76 0 1.375.616 1.375 1.375h1.25A2.625 2.625 0 0 0 17 4.375v1.25Zm-10 0h10v-1.25H7v1.25Z"
                fill="#5D6066"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="M9 9h4m-4 2h6"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGChat;
