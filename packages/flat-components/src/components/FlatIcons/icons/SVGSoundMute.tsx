import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGSoundMute: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="m17.042 14.39-1.038-1.037a7.376 7.376 0 0 0-1.317-5.735l-.175-.228.976-.78a8.629 8.629 0 0 1 1.554 7.78Zm-4.417-4.417-1.25-1.25V6.507l-1.108 1.109-.883-.884 2.174-2.174A.625.625 0 0 1 12.625 5v4.973ZM5.723 8.375H5A.625.625 0 0 0 4.375 9v6l.007.092a.625.625 0 0 0 .618.533h2.742l3.816 3.817A.625.625 0 0 0 12.625 19v-3.723l-1.25-1.25v3.465l-2.933-2.934-.075-.064A.625.625 0 0 0 8 14.375H5.625v-4.75h1.348l-1.25-1.25Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGSoundMute;
