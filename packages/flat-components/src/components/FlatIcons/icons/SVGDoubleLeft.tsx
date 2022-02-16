import "../style.less";
import React from "react";

export const SVGDoubleLeft: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            d="m11 8-2 2-2 2 2 2 2 2m6-8-2 2-2 2 2 2 2 2"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGDoubleLeft;
