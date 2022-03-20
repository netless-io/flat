import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGFolder: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
                d="m11 7-.442.442a.625.625 0 0 0 .442.183V7ZM9.293 5.293l.442-.442-.442.442ZM19 18.375H5v1.25h14v-1.25ZM4.625 18V6h-1.25v12h1.25ZM5 5.625h3.586v-1.25H5v1.25Zm3.85.11 1.708 1.707.884-.884-1.707-1.707-.884.884ZM11 7.625h8v-1.25h-8v1.25ZM19.375 8v10h1.25V8h-1.25ZM8.585 5.625c.1 0 .196.04.266.11l.884-.884a1.625 1.625 0 0 0-1.15-.476v1.25ZM4.626 6c0-.207.168-.375.375-.375v-1.25c-.897 0-1.625.728-1.625 1.625h1.25ZM5 18.375A.375.375 0 0 1 4.625 18h-1.25c0 .898.728 1.625 1.625 1.625v-1.25Zm14-10.75c.207 0 .375.168.375.375h1.25c0-.897-.727-1.625-1.625-1.625v1.25Zm0 12c.898 0 1.625-.727 1.625-1.625h-1.25a.375.375 0 0 1-.375.375v1.25Z"
                fill="#5D6066"
            ></path>
            <path
                className="flat-icon-fill-color"
                clipRule="evenodd"
                d="M4 7V6a1 1 0 0 1 1-1h3.586a1 1 0 0 1 .707.293L11 7H4Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
            <path
                className="flat-icon-fill-color"
                d="M4 7h-.625c0 .345.28.625.625.625V7Zm7 0v.625a.625.625 0 0 0 .442-1.067L11 7ZM9.293 5.293l.442-.442-.442.442ZM4.625 7V6h-1.25v1h1.25ZM5 5.625h3.586v-1.25H5v1.25Zm3.85.11 1.708 1.707.884-.884-1.707-1.707-.884.884Zm2.15.64H4v1.25h7v-1.25Zm-2.414-.75c.1 0 .195.04.265.11l.884-.884a1.625 1.625 0 0 0-1.15-.476v1.25ZM4.625 6c0-.207.168-.375.375-.375v-1.25c-.897 0-1.625.728-1.625 1.625h1.25Z"
                fill="#5D6066"
            ></path>
        </svg>
    );
};

export default SVGFolder;
