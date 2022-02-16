import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGCameraMute: React.FC<FlatIconProps> = ({
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
                d="m5 5 14 14"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-fill-color"
                clipRule="evenodd"
                d="m15.72 18.373.91.909a8.63 8.63 0 0 1-9.788-.364l-.232-.18.78-.976a7.38 7.38 0 0 0 8.33.61Zm2.434-2.87A7.625 7.625 0 0 0 7.497 4.846l.897.896a6.375 6.375 0 0 1 8.864 8.864l.896.897Zm-3.857 1.446.952.951A7.625 7.625 0 0 1 5.1 7.751l.951.952a6.375 6.375 0 0 0 8.246 8.246Zm.956-4.348a3.625 3.625 0 0 0-4.854-4.854l.964.964a2.378 2.378 0 0 1 2.926 2.926l.964.964Zm-.628-5.351a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGCameraMute;
