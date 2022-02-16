import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGScreenSharing: React.FC<FlatIconProps> = ({
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
                d="M12 17v3m-3 0h6"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-fill-color"
                d="M18.375 11v4h1.25v-4h-1.25ZM17 16.375H7v1.25h10v-1.25ZM5.625 15V8h-1.25v7h1.25ZM7 6.625h5v-1.25H7v1.25ZM5.625 8c0-.76.616-1.375 1.375-1.375v-1.25A2.625 2.625 0 0 0 4.375 8h1.25ZM7 16.375c-.76 0-1.375-.616-1.375-1.375h-1.25A2.625 2.625 0 0 0 7 17.625v-1.25ZM18.375 15c0 .76-.616 1.375-1.375 1.375v1.25A2.625 2.625 0 0 0 19.625 15h-1.25Z"
                fill="#5D6066"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="m17 4 2 2-2 2"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-fill-color"
                d="M19 5.375h-3v1.25h3v-1.25ZM13.375 8v3h1.25V8h-1.25ZM16 5.375A2.625 2.625 0 0 0 13.375 8h1.25c0-.76.616-1.375 1.375-1.375v-1.25Z"
                fill="#5D6066"
            ></path>
        </svg>
    );
};

export default SVGScreenSharing;
