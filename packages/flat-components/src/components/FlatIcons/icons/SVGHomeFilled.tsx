import "../style.less";
import React from "react";

export const SVGHomeFilled: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            className="flat-icon-stroke"
            clipRule="evenodd"
            d="m4 9 8-5 8 5h-2v11h-4v-6h-4v6H6V9H4Z"
            fill="#5D6066"
            fillRule="evenodd"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGHomeFilled;
