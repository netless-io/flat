import "../style.less";
import React from "react";

export const SVGToolbarFullscreen: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            d="M17 5h4v4M7 5H3v4m14 10h4v-4M7 19H3v-4m2.625-7.375h12.75v8.75H5.625z"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGToolbarFullscreen;
