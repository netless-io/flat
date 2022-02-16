import "../style.less";
import React from "react";

export const SVGCircleLeftFilled: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M3.375 12a8.625 8.625 0 1 1 17.25 0 8.625 8.625 0 0 1-17.25 0Zm11.067-3.558-.884-.884-4 4-.072.087a.625.625 0 0 0 .072.797l4 4 .884-.884L10.883 12l3.559-3.558Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGCircleLeftFilled;
