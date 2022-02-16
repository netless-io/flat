import "../style.less";
import React from "react";

export const SVGLast: React.FC<React.SVGProps<SVGSVGElement>> = props => (
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
            d="m12.43 12.546 7 4.454V7l-7 4.454V7l-7.857 5 7.857 5v-4.454Z"
            fill="#5D6066"
            fillRule="evenodd"
        ></path>
    </svg>
);

export default SVGLast;
