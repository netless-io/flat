import "../style.less";
import React from "react";

export const SVGCircleExclamationF: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M3.375 12a8.625 8.625 0 1 1 17.25 0 8.625 8.625 0 0 1-17.25 0Zm9.25-5v6h-1.25V7h1.25ZM13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGCircleExclamationF;
