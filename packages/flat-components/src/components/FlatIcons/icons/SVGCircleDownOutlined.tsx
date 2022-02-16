import "../style.less";
import React from "react";

export const SVGCircleDownOutlined: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle
            className="flat-icon-stroke"
            cx="12"
            cy="12"
            r="8"
            stroke="#5D6066"
            strokeWidth="1.25"
            transform="rotate(-90 12 12)"
        ></circle>
        <path
            className="flat-icon-stroke"
            d="m16 10-2 2-2 2-2-2-2-2"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGCircleDownOutlined;
