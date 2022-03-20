import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGExit: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M15.625 7V6h-1.25v1h1.25ZM14 4.375H6v1.25h8v-1.25ZM4.375 6v12h1.25V6h-1.25ZM6 19.625h8v-1.25H6v1.25ZM15.625 18v-1h-1.25v1h1.25ZM14 19.625c.898 0 1.625-.727 1.625-1.625h-1.25a.375.375 0 0 1-.375.375v1.25ZM4.375 18c0 .898.728 1.625 1.625 1.625v-1.25A.375.375 0 0 1 5.625 18h-1.25ZM6 4.375c-.897 0-1.625.728-1.625 1.625h1.25c0-.207.168-.375.375-.375v-1.25ZM15.625 6c0-.897-.727-1.625-1.625-1.625v1.25c.207 0 .375.168.375.375h1.25Z"
                fill="#5D6066"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="M10 12h9m-3 3 3-3-3-3"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGExit;
