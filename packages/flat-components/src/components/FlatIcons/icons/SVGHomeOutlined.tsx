import "../style.less";
import React from "react";

export const SVGHomeOutlined: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            d="m4 9 8-5 8 5M6 11v9h4v-6h4v6h4v-9"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGHomeOutlined;
