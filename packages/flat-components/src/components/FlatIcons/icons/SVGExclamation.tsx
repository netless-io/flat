import "../style.less";
import React from "react";

export const SVGExclamation: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle className="flat-icon-fill" cx="12" cy="18" fill="#5D6066" r="1"></circle>
        <path
            className="flat-icon-stroke"
            d="M12 15V5"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGExclamation;
