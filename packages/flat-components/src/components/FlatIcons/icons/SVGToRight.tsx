import "../style.less";
import React from "react";

export const SVGToRight: React.FC<React.SVGProps<SVGSVGElement>> = props => (
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
            d="M19 6v12m-6-2 2-2 2-2-2-2-2-2m4 4H5"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGToRight;
