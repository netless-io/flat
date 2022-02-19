import "./style.less";
import React from "react";

export const SVGSchedule: React.FC = () => (
    <svg className="svg-schedule" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
            <circle className="svg-schedule-background" cx="20" cy="20" fill="#3381FF" r="20" />
            <path d="M8 8h24v24H8z" fill="#FFF" opacity=".01" />
            <path
                d="M12 14h16v14H12zm4-2v2m8-2v4"
                stroke="#FFF"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                d="M12 18h16v-3a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v3Z"
                fill="#FFF"
                stroke="#FFF"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </g>
    </svg>
);
