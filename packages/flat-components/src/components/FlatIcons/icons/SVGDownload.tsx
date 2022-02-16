import "../style.less";
import React from "react";

export const SVGDownload: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            d="M12 5v10m-4-4 4 4 4-4M4 17v2h16v-2"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGDownload;
