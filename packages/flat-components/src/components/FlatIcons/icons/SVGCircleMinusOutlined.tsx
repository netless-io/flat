import "../style.less";
import React from "react";

export const SVGCircleMinusOutlined: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle
            className="flat-icon-stroke"
            cx="12"
            cy="12"
            r="8"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></circle>
        <path
            className="flat-icon-stroke"
            d="M8 12h8"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGCircleMinusOutlined;
