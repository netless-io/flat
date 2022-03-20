import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGSortVertical: React.FC<FlatIconProps> = ({
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
                clipRule="evenodd"
                d="m16 10-2-2-2-2-2 2-2 2h8Zm0 4-2 2-2 2-2-2-2-2h8Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

export default SVGSortVertical;
