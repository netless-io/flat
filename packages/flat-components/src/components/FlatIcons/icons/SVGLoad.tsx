import "../style.less";
import React from "react";

export const SVGLoad: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            d="M12 4v4"
            opacity=".8"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M12 16v4"
            opacity=".1"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="m17.657 6.343-2.829 2.829"
            opacity=".7"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="m9.172 14.828-2.829 2.829"
            opacity=".05"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M20 12h-4"
            opacity=".5"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M8 12H4"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="m17.657 17.657-2.829-2.829"
            opacity=".3"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M9.172 9.172 6.343 6.343"
            opacity=".9"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGLoad;
