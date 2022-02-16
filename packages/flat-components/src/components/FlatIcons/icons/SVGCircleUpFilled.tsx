import "../style.less";
import React from "react";

export const SVGCircleUpFilled: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M12 3.375a8.625 8.625 0 1 0 0 17.25 8.625 8.625 0 0 0 0-17.25ZM8.442 14.442l-.884-.884 4-4 .087-.072a.625.625 0 0 1 .797.072l4 4-.884.884L12 10.883l-3.558 3.559Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGCircleUpFilled;
