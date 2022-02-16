import "../style.less";
import React from "react";

export const SVGNext: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M11.57 12.546 4.57 17V7l7 4.454V7l7.857 5-7.857 5v-4.454Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGNext;
