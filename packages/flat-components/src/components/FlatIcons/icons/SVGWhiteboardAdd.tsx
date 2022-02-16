import "../style.less";
import React from "react";

export const SVGWhiteboardAdd: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            d="M4 20h16M4 6h16"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <rect
            className="flat-icon-stroke"
            height="10"
            rx="1"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
            width="14"
            x="5"
            y="8"
        ></rect>
        <path
            className="flat-icon-stroke"
            d="M12 4v2m-3 7h6m-3-3v6"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGWhiteboardAdd;
