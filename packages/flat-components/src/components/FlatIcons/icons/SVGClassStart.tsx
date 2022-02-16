import "../style.less";
import React from "react";

export const SVGClassStart: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M16 11v7l5.5-3.5L16 11Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M20 11V6h-5a3 3 0 0 0-3 3v5-5a3 3 0 0 0-3-3H4v10a1 1 0 0 0 1 1h5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGClassStart;
