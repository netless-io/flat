import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGLogo: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
    return (
        <svg
            className={`${className} flat-icon ${active ? "is-active" : ""}`}
            fill="none"
            height="64"
            viewBox="0 0 64 64"
            width="64"
            xmlns="http://www.w3.org/2000/svg"
            {...restProps}
        >
            <path
                className="flat-icon-fill-color"
                clipRule="evenodd"
                d="M19.7 22.56a2.4 2.4 0 0 1 2.4-2.4h2.4v2.4h-4.8Zm0 .6h3.6v1.8h1.2v2.4h-1.2v8.4h-3.6v-8.4h-1.2v-2.4h1.2v-1.8Zm6-3h1.2a2.4 2.4 0 0 1 2.4 2.4v13.2h-3.6v-15.6Zm10.2 4.8h-3.6v2.4h3.6v6h-1.8v-2.4h1.2v-2.4h-2.4a2.4 2.4 0 0 0-2.4 2.4v2.4a2.4 2.4 0 0 0 2.4 2.4h6.6v-8.4a2.4 2.4 0 0 0-2.4-2.4h-1.2Zm4.8 8.4a2.4 2.4 0 0 0 2.4 2.4h2.4v-2.4h-1.2v-6h1.2v-2.4h-1.2v-2.4a2.4 2.4 0 0 0-2.4-2.4h-1.2v13.2Zm-23.1 6h9.6l4.8 1.2 4.8-1.2h9.6v1.2h-9.6l-4.8 1.2-4.8-1.2h-9.6v-1.2Zm4.8 2.4h4.8l4.8 1.2 4.8-1.2h14.4v1.2H36.8l-4.8 1.2-4.8-1.2H12.8v-1.2h9.6Z"
                fill="#B7BBC1"
                fillRule="evenodd"
            />
        </svg>
    );
};

export default SVGLogo;
