import "../style.less";
import React from "react";

export const SVGModeInteractive: React.FC<React.SVGProps<SVGSVGElement>> = props => (
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
            d="M15.536 4.222a2 2 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.828l-9.9 9.9-4.95.707.708-4.95 9.9-9.9Z"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="m14.121 5.636 4.243 4.243"
            stroke="#5D6066"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="m16.243 7.757-5.657 5.657m-3.536.707v1.415h1.414v1.414H9.88"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGModeInteractive;
