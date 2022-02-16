import "../style.less";
import React from "react";

export const SVGCircleDownFilled: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M12 20.625a8.625 8.625 0 1 1 0-17.25 8.625 8.625 0 0 1 0 17.25ZM8.442 9.558l-.884.884 4 4 .087.072c.243.169.58.145.797-.072l4-4-.884-.884L12 13.117 8.442 9.558Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGCircleDownFilled;
