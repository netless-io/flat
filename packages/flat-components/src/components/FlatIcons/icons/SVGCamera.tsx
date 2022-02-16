import "../style.less";
import React from "react";

export const SVGCamera: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle
            className="flat-icon-stroke"
            cx="12"
            cy="11"
            r="7"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></circle>
        <circle
            className="flat-icon-stroke"
            cx="12"
            cy="11"
            r="3"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></circle>
        <circle className="flat-icon-fill" cx="14.625" cy="6.625" fill="#5D6066" r=".625"></circle>
        <path
            className="flat-icon-stroke"
            d="M7 18.25a8.004 8.004 0 0 0 10 0"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGCamera;
