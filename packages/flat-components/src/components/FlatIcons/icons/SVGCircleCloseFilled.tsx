import "../style.less";
import React from "react";

export const SVGCircleCloseFilled: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M12 3.375a8.625 8.625 0 1 0 0 17.25 8.625 8.625 0 0 0 0-17.25Zm2.558 5.183.884.884L12.884 12l2.558 2.558-.884.884L12 12.884l-2.558 2.558-.884-.884L11.116 12 8.558 9.442l.884-.884L12 11.116l2.558-2.558Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGCircleCloseFilled;
