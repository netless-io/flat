import "./style.less";
import React from "react";

export const SVGJoin: React.FC = () => (
    <svg className="svg-join" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
            <circle className="svg-join-background" cx="20" cy="20" fill="#3381FF" r="20" />
            <path d="M8 8h24v24H8z" fill="#FFF" opacity=".01" />
            <path
                d="m20 13 6-2v16l-6 2z"
                fill="#FFF"
                stroke="#FFF"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path d="M18 27h-4V11h12v16" stroke="#FFF" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
    </svg>
);
