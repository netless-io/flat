import "../style.less";
import React from "react";

export const SVGVideoFold: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            d="M11 17v-4H7m6-6v4h4m1-5-4 4-1 1m-7 7 4-4 1-1"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGVideoFold;
