import "../style.less";
import React from "react";

export const SVGAppsAdd: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            d="M5 5h6v6H5zm8 0h6v6h-6zm0 11h6m-3-3v6M5 13h6v6H5z"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGAppsAdd;
