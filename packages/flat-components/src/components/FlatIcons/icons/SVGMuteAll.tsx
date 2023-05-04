import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGMuteAll: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M8.098 18.553c.294.047.595.072.902.072v-.974l-.902.902Zm-1.072-4.231-.895.895A3.61 3.61 0 0 1 5.375 13V7a3.625 3.625 0 0 1 7.186-.682 3.634 3.634 0 0 1 3.307-.839l-4.493 4.494V9c0-.74.221-1.427.601-2h-.601a2.375 2.375 0 1 0-4.75 0v6c0 .49.148.944.401 1.322Zm2.69 2.613 1.008-1.007a4.377 4.377 0 0 0 8.65-.928v-1h1.25v1a5.625 5.625 0 0 1-10.908 1.935Zm1.669-1.668 1.24-1.24V15a2.375 2.375 0 1 0 4.75 0V9.276l1.145-1.145c.069.278.105.57.105.869v6a3.625 3.625 0 0 1-7.24.267Zm-5.788.483-.887.888A5.603 5.603 0 0 1 3.375 13v-1h1.25v1c0 1.042.364 1.999.972 2.75Z"
                fill="#5D6066"
                fillRule="evenodd"
            />
            <path
                className="flat-icon-stroke-color"
                d="M4.93 19.071 19.072 4.929"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGMuteAll;
