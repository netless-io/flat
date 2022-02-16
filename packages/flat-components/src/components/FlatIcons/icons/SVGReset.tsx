import "../style.less";
import React from "react";

export const SVGReset: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle className="flat-icon-fill" cx="12" cy="12" fill="#5D6066" r="2"></circle>
        <path
            className="flat-icon-stroke"
            d="M12 3v4m0 10v4m9-9h-4M7 12H3"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <circle
            className="flat-icon-stroke"
            cx="12"
            cy="12"
            r="7"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></circle>
    </svg>
);

export default SVGReset;
