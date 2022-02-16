import "../style.less";
import React from "react";

export const SVGInfo: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle className="flat-icon-fill" cx="12" cy="6" fill="#5D6066" r="1"></circle>
        <path
            className="flat-icon-stroke"
            d="M12 19V9"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGInfo;
