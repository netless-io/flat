import "./style.less";
import React from "react";

export const SVGBegin: React.FC = () => (
    <svg className="svg-begin" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#a)">
            <rect fill="url(#b)" height="40" rx="12" width="40" />
        </g>
        <path
            clipRule="evenodd"
            d="M19.709 15.83A4 4 0 0 0 15.712 12H10v11.667a3 3 0 0 0 3 3h4.5V27a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-.333H27a3 3 0 0 0 3-3V12h-5.712a4 4 0 0 0-3.997 3.83L20 22.667l-.291-6.837Z"
            stroke="#fff"
            strokeLinejoin="round"
            strokeWidth="2"
        />
        <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="b" x1="20" x2="20" y1="0" y2="40">
                <stop stopColor="#3381FF" />
                <stop offset="1" stopColor="#3733FF" />
            </linearGradient>
            <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="40"
                id="a"
                width="40"
                x="0"
                y="0"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="4" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend in2="shape" result="effect1_innerShadow_4562_763" />
            </filter>
        </defs>
    </svg>
);
