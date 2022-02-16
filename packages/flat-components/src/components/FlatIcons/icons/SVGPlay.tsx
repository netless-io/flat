import "../style.less";
import React from "react";

export const SVGPlay: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M6.5 5v14l11-7-11-7Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGPlay;
