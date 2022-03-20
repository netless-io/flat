import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGQuestion: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
    return (
        <svg
            className={`${className} flat-icon ${active ? "is-active" : ""}`}
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            {...restProps}
        >
            <path
                className="flat-icon-fill-color"
                clipRule="evenodd"
                d="M14.942 6.139a4.16 4.16 0 0 0-5.884 5.884l.884-.884-.131-.14a2.91 2.91 0 1 1 4.247.14l-2.5 2.5-.064.075a.626.626 0 0 0-.119.367v2h1.25v-1.743l2.317-2.315.157-.166a4.16 4.16 0 0 0-.157-5.718ZM12 19.08a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGQuestion;
