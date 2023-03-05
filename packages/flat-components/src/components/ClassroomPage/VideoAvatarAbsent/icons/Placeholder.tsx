import React from "react";

export interface SVGPlaceHolderProps {
    className?: string;
    isDark?: boolean;
}

export const SVGPlaceHolder: React.FC<SVGPlaceHolderProps> = ({ className, isDark }) => {
    const stopColor = isDark ? "#33353D" : "#D5D9E0";

    return (
        <svg
            className={className}
            fill="none"
            height="80"
            viewBox="0 0 80 80"
            width="80"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0 80V71.7607C0 61.8652 6.62305 53.1938 16.1699 50.5898L19.873 49.5801C24.6387 48.2808 28.4375 44.6855 30 40L29.3926 39.3936C26.5801 36.5806 25 32.7651 25 28.7866V26.25C22.3535 23.9341 22.3535 19.8159 25 17.5V15C25 6.71582 31.7148 0 40 0C48.2852 0 55 6.71582 55 15V17.5C57.6465 19.8159 57.6465 23.9341 55 26.25V28.7866C55 32.7651 53.4199 36.5806 50.6074 39.3936L50 40C51.5625 44.6855 55.3613 48.2808 60.127 49.5801L63.8301 50.5898C73.377 53.1938 80 61.8652 80 71.7607V80H0Z"
                fill="url(#paint0_linear_4451_134)"
            />
            <defs>
                <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint0_linear_4451_134"
                    x1="40"
                    x2="40"
                    y1="0"
                    y2="80"
                >
                    <stop stopColor={stopColor} />
                    <stop offset="1" stopColor={stopColor} stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default SVGPlaceHolder;
