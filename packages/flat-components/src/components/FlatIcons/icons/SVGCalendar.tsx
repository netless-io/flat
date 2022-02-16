import "../style.less";
import React from "react";

export const SVGCalendar: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect
            className="flat-icon-stroke"
            height="14"
            rx="1"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
            width="16"
            x="4"
            y="6"
        ></rect>
        <path
            className="flat-icon-stroke"
            d="M8 4v4m8-4v4m-9 2h10"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGCalendar;
