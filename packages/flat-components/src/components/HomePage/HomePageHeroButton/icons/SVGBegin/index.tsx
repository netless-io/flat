import "./style.less";
import React from "react";

export const SVGBegin: React.FC = () => (
    <svg className="svg-begin" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
            <circle className="svg-begin-background" cx="20" cy="20" fill="#3381FF" r="20" />
            <path d="M8 8h24v24H8z" fill="#FFF" opacity=".01" />
            <path d="M11 20h18m-9-9v18" stroke="#FFF" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
    </svg>
);
