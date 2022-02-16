import "../style.less";
import React from "react";

export const SVGCloudOutlined: React.FC<React.SVGProps<SVGSVGElement>> = props => (
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
            d="M6.48 8.099a4 4 0 0 1 6.838-.334 3.5 3.5 0 0 1 5.591 3.53A3.5 3.5 0 0 1 17.5 18l-10.499.001a4 4 0 0 1-.997-7.875L6 10"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
        <path
            className="flat-icon-stroke"
            d="M9.497 10.875A4 4 0 1 0 7 18"
            stroke="#5D6066"
            strokeLinejoin="round"
            strokeWidth="1.25"
        ></path>
    </svg>
);

export default SVGCloudOutlined;
