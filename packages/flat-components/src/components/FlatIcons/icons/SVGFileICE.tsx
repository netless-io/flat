import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGFileICE: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
    return (
        <svg
            className={`${className} flat-icon ${active && "is-active"}`}
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
                d="M15.48 14.918c.469-1.018.338-3.789-.225-5.017-.01.207-.094.462-.2.482a9.91 9.91 0 0 1-.092-.207C14.487 9.1 13.993 7.982 11.57 6c.206.455.432 1.193.325 1.593-.12-.028-.208-.195-.238-.407-.194.138-.35.536-.475 1.02-.215-.29-.094-.688-.006-.98.017-.054.032-.105.044-.15-1.962 1.902-2.824 4.3-2.628 5.67-.247-.271-.333-.419-.548-.957C7.709 14.546 9.316 18 12.033 18 14.637 18 16 14.965 16 14.633c-.07.04-.118.076-.163.109a1.003 1.003 0 0 1-.357.176Zm-4.762 1.346c-.633.09-1.228-.544-1.33-1.416-.102-.872.328-1.652.96-1.742.633-.09 1.229.544 1.33 1.416.102.872-.328 1.652-.96 1.742Zm2.766 0c.633.09 1.228-.544 1.33-1.416.102-.872-.328-1.652-.96-1.742-.633-.09-1.229.544-1.33 1.416-.102.872.328 1.652.96 1.742Z"
                fill="#5D6066"
                fillRule="evenodd"
            ></path>
            <path
                className="flat-icon-fill-color"
                d="m14 3 .442-.442A.625.625 0 0 0 14 2.375V3Zm6 6h.625a.625.625 0 0 0-.183-.442L20 9ZM6 3.625h8v-1.25H6v1.25Zm7.558-.183 6 6 .884-.884-6-6-.884.884ZM19.375 9v10h1.25V9h-1.25ZM18 20.375H6v1.25h12v-1.25ZM4.625 19V5h-1.25v14h1.25ZM6 20.375c-.76 0-1.375-.616-1.375-1.375h-1.25A2.625 2.625 0 0 0 6 21.625v-1.25ZM19.375 19c0 .76-.616 1.375-1.375 1.375v1.25A2.625 2.625 0 0 0 20.625 19h-1.25ZM6 2.375A2.625 2.625 0 0 0 3.375 5h1.25c0-.76.616-1.375 1.375-1.375v-1.25Z"
                fill="#5D6066"
            ></path>
        </svg>
    );
};

export default SVGFileICE;
