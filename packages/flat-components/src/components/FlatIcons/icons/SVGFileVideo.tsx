import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGFileVideo: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="m14 3 .442-.442A.625.625 0 0 0 14 2.375V3Zm6 6h.625a.625.625 0 0 0-.183-.442L20 9ZM6 3.625h8v-1.25H6v1.25Zm7.558-.183 6 6 .884-.884-6-6-.884.884ZM19.375 9v10h1.25V9h-1.25ZM18 20.375H6v1.25h12v-1.25ZM4.625 19V5h-1.25v14h1.25ZM6 20.375c-.76 0-1.375-.616-1.375-1.375h-1.25A2.625 2.625 0 0 0 6 21.625v-1.25ZM19.375 19c0 .76-.616 1.375-1.375 1.375v1.25A2.625 2.625 0 0 0 20.625 19h-1.25ZM6 2.375A2.625 2.625 0 0 0 3.375 5h1.25c0-.76.616-1.375 1.375-1.375v-1.25Z"
                fill="#5D6066"
            ></path>
            <path
                className="flat-icon-fill-color"
                clipRule="evenodd"
                d="M8 11a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1l2 1v-4l-2 1v-1a1 1 0 0 0-1-1H8Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGFileVideo;
