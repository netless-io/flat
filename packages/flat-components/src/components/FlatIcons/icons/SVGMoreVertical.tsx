import "../style.less";
import React from "react";

export const SVGMoreVertical: React.FC<React.SVGProps<SVGSVGElement>> = props => (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            className="flat-icon-fill"
            clipRule="evenodd"
            d="M12 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm-1 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGMoreVertical;
