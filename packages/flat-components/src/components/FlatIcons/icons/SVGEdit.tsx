import "../style.less";
import React from "react";

export const SVGEdit: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            d="M18.375 12v5h1.25v-5h-1.25ZM17 18.375H7v1.25h10v-1.25ZM5.625 17V7h-1.25v10h1.25ZM7 5.625h5v-1.25H7v1.25ZM5.625 7c0-.76.616-1.375 1.375-1.375v-1.25A2.625 2.625 0 0 0 4.375 7h1.25ZM7 18.375c-.76 0-1.375-.616-1.375-1.375h-1.25A2.625 2.625 0 0 0 7 19.625v-1.25ZM18.375 17c0 .76-.616 1.375-1.375 1.375v1.25A2.625 2.625 0 0 0 19.625 17h-1.25Z"
            fill="#5D6066"
        ></path>
        <path
            className="flat-icon-stroke"
            d="m19 5-7 7"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGEdit;
