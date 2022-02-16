import "../style.less";
import React from "react";

export const SVGGeneral: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect
            className="flat-icon-stroke"
            height="6"
            rx="3"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
            width="6"
            x="5"
            y="5"
        ></rect>
        <rect
            className="flat-icon-stroke"
            height="6"
            rx="3"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
            width="6"
            x="13"
            y="5"
        ></rect>
        <rect
            className="flat-icon-stroke"
            height="6"
            rx="3"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
            width="6"
            x="5"
            y="13"
        ></rect>
        <rect
            className="flat-icon-stroke"
            height="6"
            rx="3"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
            width="6"
            x="13"
            y="13"
        ></rect>
    </svg>
);

export default SVGGeneral;
