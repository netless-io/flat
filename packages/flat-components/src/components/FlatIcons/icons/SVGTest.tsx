import "../style.less";
import React from "react";

export const SVGTest: React.FC<React.SVGProps<SVGSVGElement>> = props => (
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
            d="M11 16v3m-3 0h6"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-fill"
            d="M17.375 13v1h1.25v-1h-1.25ZM16 15.375H6v1.25h10v-1.25ZM4.625 14V7h-1.25v7h1.25ZM6 5.625h5v-1.25H6v1.25ZM4.625 7c0-.76.616-1.375 1.375-1.375v-1.25A2.625 2.625 0 0 0 3.375 7h1.25ZM6 15.375c-.76 0-1.375-.616-1.375-1.375h-1.25A2.625 2.625 0 0 0 6 16.625v-1.25ZM17.375 14c0 .76-.616 1.375-1.375 1.375v1.25A2.625 2.625 0 0 0 18.625 14h-1.25Z"
            fill="#5D6066"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M11 8h3l1-3 2 6 1-3h2"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGTest;
