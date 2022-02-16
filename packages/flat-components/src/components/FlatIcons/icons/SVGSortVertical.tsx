import "../style.less";
import React from "react";

export const SVGSortVertical: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="m16 10-2-2-2-2-2 2-2 2h8Zm0 4-2 2-2 2-2-2-2-2h8Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGSortVertical;
