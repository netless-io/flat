import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGLogout: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="M15.625 7V6H14.375V7H15.625ZM14 4.375H6V5.625H14V4.375ZM4.375 6V18H5.625V6H4.375ZM6 19.625H14V18.375H6V19.625ZM15.625 18V17H14.375V18H15.625ZM14 19.625C14.8975 19.625 15.625 18.8975 15.625 18H14.375C14.375 18.2071 14.2071 18.375 14 18.375V19.625ZM4.375 18C4.375 18.8975 5.10254 19.625 6 19.625V18.375C5.79289 18.375 5.625 18.2071 5.625 18H4.375ZM6 4.375C5.10254 4.375 4.375 5.10254 4.375 6H5.625C5.625 5.79289 5.79289 5.625 6 5.625V4.375ZM15.625 6C15.625 5.10254 14.8975 4.375 14 4.375V5.625C14.2071 5.625 14.375 5.79289 14.375 6H15.625Z"
                fill="#D21F00"
            />
            <path d="M10 12H19" stroke="#D21F00" strokeLinejoin="round" strokeWidth="1.25" />
            <path
                d="M16 15L19 12L16 9"
                stroke="#D21F00"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default SVGLogout;
