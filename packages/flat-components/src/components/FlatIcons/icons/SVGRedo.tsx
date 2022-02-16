import "../style.less";
import React from "react";

export const SVGRedo: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            d="M5 9.625h10v-1.25H5v1.25ZM18.375 13v6h1.25v-6h-1.25ZM15 9.625A3.375 3.375 0 0 1 18.375 13h1.25A4.625 4.625 0 0 0 15 8.375v1.25Z"
            fill="#5D6066"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M9 5 5 9l4 4"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGRedo;
