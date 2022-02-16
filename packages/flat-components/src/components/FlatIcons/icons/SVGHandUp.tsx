import "../style.less";
import React from "react";

export const SVGHandUp: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-stroke"
            d="M15.869 12.624a3 3 0 0 0-2.121 3.674"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            clipRule="evenodd"
            d="m17.4 17.617 2.554-7.549a.862.862 0 0 0-.385-1.023.815.815 0 0 0-1.05.202l-2.65 3.377-2.07-7.727a1 1 0 0 0-1.932.517l1.294 4.83-.966.259-1.812-6.762a1 1 0 1 0-1.932.518l1.812 6.761-.966.26-1.553-5.796A1 1 0 0 0 5.812 6l1.553 5.796-.966.259-1.035-3.864a1 1 0 1 0-1.932.518l2.588 9.659a4 4 0 0 0 4.9 2.828l3.727-.998a4 4 0 0 0 2.754-2.582Z"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGHandUp;
