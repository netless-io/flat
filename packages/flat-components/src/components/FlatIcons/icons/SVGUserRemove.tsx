import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGUserRemove: React.FC<FlatIconProps> = ({
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
                className="flat-icon-stroke-color"
                d="m19.828 19.828-5.656-5.656m0 5.656 5.656-5.656"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            ></path>
            <path
                className="flat-icon-fill-color"
                d="m7.265 14.925.294.552-.294-.552Zm-.03.724.324-.172-.588-1.103-.324.173.588 1.102Zm3.203-3.128.121-.242-1.118-.559-.12.242 1.117.559Zm-.813-2.935V7h-1.25v2.586h1.25ZM14.375 7v2.586h1.25V7h-1.25Zm-.934 5.28.496.99 1.118-.558-.496-.992-1.118.56Zm.934-2.694c0 .74-.294 1.449-.817 1.972l.884.884a4.04 4.04 0 0 0 1.183-2.856h-1.25ZM9.625 7A2.375 2.375 0 0 1 12 4.625v-1.25A3.625 3.625 0 0 0 8.375 7h1.25Zm.817 4.558a2.79 2.79 0 0 1-.817-1.972h-1.25c0 1.071.426 2.098 1.183 2.856l.884-.884Zm-2.883 3.919a6.793 6.793 0 0 0 2.88-2.956l-1.119-.559a5.543 5.543 0 0 1-2.349 2.412l.588 1.103ZM12 4.625A2.375 2.375 0 0 1 14.375 7h1.25A3.625 3.625 0 0 0 12 3.375v1.25ZM4.625 20a4.93 4.93 0 0 1 2.61-4.35l-.588-1.103A6.18 6.18 0 0 0 3.375 20h1.25Z"
                fill="#5D6066"
            ></path>
        </svg>
    );
};

export default SVGUserRemove;
