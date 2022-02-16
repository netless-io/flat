import "../style.less";
import React from "react";

export const SVGSound: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            clipRule="evenodd"
            d="M5 15V9h3l4-4v14l-4-4H5Z"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-fill"
            d="M14.512 7.39a7.379 7.379 0 0 1 0 9.22l.976.78a8.629 8.629 0 0 0 0-10.78l-.976.78Z"
            fill="#5D6066"
        ></path>
    </svg>
);

export default SVGSound;
