import "../style.less";
import React from "react";

export const SVGClassEnd: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M19 11a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm1.5 2h-3v3h3v-3Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M20 10V6h-5a3 3 0 0 0-3 3v5-5a3 3 0 0 0-3-3H4v10a1 1 0 0 0 1 1h5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGClassEnd;
