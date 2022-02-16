import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGModeLecture: React.FC<FlatIconProps> = ({
    active,
    className = "",
    ...restProps
}) => {
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
                d="M4 6v-.625A.625.625 0 0 0 3.375 6H4Zm16 0h.625A.625.625 0 0 0 20 5.375V6Zm-8.625 8a.625.625 0 1 0 1.25 0h-1.25ZM9 5.375H4v1.25h5v-1.25ZM3.375 6v10h1.25V6h-1.25ZM5 17.625h5v-1.25H5v1.25Zm6 1h2v-1.25h-2v1.25Zm3-1h5v-1.25h-5v1.25ZM20.625 16V6h-1.25v10h1.25ZM20 5.375h-5v1.25h5v-1.25ZM11.375 9v5h1.25V9h-1.25Zm1.25 5V9h-1.25v5h1.25ZM15 5.375A3.625 3.625 0 0 0 11.375 9h1.25A2.375 2.375 0 0 1 15 6.625v-1.25ZM9.375 17c0 .898.727 1.625 1.625 1.625v-1.25a.375.375 0 0 1-.375-.375h-1.25Zm9.625.625c.898 0 1.625-.727 1.625-1.625h-1.25a.375.375 0 0 1-.375.375v1.25ZM3.375 16c0 .898.728 1.625 1.625 1.625v-1.25A.375.375 0 0 1 4.625 16h-1.25ZM13 18.625c.898 0 1.625-.727 1.625-1.625h-1.25a.375.375 0 0 1-.375.375v1.25Zm-4-12A2.375 2.375 0 0 1 11.375 9h1.25A3.625 3.625 0 0 0 9 5.375v1.25Z"
                fill="#5D6066"
            ></path>
        </svg>
    );
};

export default SVGModeLecture;
