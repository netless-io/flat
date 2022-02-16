import "../style.less";
import React from "react";

export const SVGUpdate: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            className="flat-icon-stroke"
            d="m9 11 3-3 3 3m-3-3v8m-8-4a8 8 0 0 0 13.646 5.667M20 12V6M4 12v6"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M20 12A8 8 0 0 0 6.354 6.333"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGUpdate;
