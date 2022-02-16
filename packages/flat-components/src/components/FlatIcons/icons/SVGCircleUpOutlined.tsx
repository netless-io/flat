import "../style.less";
import React from "react";

export const SVGCircleUpOutlined: React.FC<React.SVGProps<SVGSVGElement>> = props => (
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
            r="8"
            stroke="#5D6066"
            strokeWidth="1.25"
            transform="matrix(0 1 1 0 12 12)"
        ></circle>
        <path
            className="flat-icon-stroke"
            d="m16 14-2-2-2-2-2 2-2 2"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGCircleUpOutlined;
