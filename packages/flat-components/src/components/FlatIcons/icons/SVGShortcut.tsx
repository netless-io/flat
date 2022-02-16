import "../style.less";
import React from "react";

export const SVGShortcut: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            clipRule="evenodd"
            d="M4 18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12Z"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M7 15h10M7 9.5h2m-2 2h2m1-2h1m-1 2h1m2-2h2m1 0h1m-4 2h2m1 0h1"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGShortcut;
