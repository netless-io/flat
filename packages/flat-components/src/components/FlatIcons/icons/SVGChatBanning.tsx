import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGChatBanning: React.FC<FlatIconProps> = ({
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
                className="flat-icon-fill-color"
                clipRule="evenodd"
                d="M18.674 16.022A2.62 2.62 0 0 0 19.625 14V7A2.625 2.625 0 0 0 17 4.375H7.027l1.25 1.25H17c.76 0 1.375.616 1.375 1.375v7c0 .469-.235.883-.593 1.13l.892.892Zm-5.95-.647 1.25 1.25h-1.717l-2.815 2.817a.625.625 0 0 1-1.06-.347L8.375 19v-2.375H7a2.625 2.625 0 0 1-2.62-2.459L4.375 14V7.027l1.25 1.25V14c0 .76.616 1.375 1.375 1.375h2c.345 0 .625.28.625.625v1.491l1.933-1.933a.625.625 0 0 1 .344-.175l.098-.008h.723Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
            <path
                className="flat-icon-stroke-color"
                d="m5 5 14 14"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
        </svg>
    );
};

export default SVGChatBanning;
