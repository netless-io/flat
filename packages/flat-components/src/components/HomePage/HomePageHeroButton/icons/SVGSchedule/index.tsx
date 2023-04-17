import "./style.less";
import React from "react";

export const SVGSchedule: React.FC = () => (
    <svg
        className="svg-schedule"
        fill="none"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g filter="url(#a)">
            <rect fill="url(#b)" height="40" rx="12" width="40" />
        </g>
        <rect
            height="16"
            rx="3"
            stroke="#fff"
            strokeLinejoin="round"
            strokeWidth="2"
            width="18"
            x="11"
            y="12"
        />
        <path
            d="M11 15a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3H11v-3Z"
            stroke="#fff"
            strokeLinejoin="round"
            strokeWidth="2"
        />
        <path
            d="M16 10v3m8-3v3"
            stroke="#fff"
            strokeLinecap="round"
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
                <feBlend in2="shape" result="effect1_innerShadow_4562_770" />
            </filter>
        </defs>
    </svg>
);
