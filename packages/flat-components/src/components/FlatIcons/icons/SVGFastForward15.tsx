import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGFastForward15: React.FC<FlatIconProps> = ({
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
                d="M20 12V6"
                stroke="#5D6066"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-stroke-color"
                d="M20 12a8 8 0 1 0-2.5 5.81"
                stroke="#5D6066"
                strokeWidth="1.25"
            />
            <path
                className="flat-icon-fill-color"
                d="M11.21 14.485V15.5H7.14v-1.015h1.44v-3.97a7.167 7.167 0 0 1 .02-.54l-.95.79a.472.472 0 0 1-.375.1.503.503 0 0 1-.15-.06.45.45 0 0 1-.1-.09l-.435-.585 2.23-1.89h1.135v6.245h1.255Zm2.706-3.64a4.34 4.34 0 0 1 .835-.085c.38 0 .715.058 1.005.175.293.113.538.27.735.47.2.2.35.435.45.705.1.27.15.56.15.87 0 .387-.069.74-.205 1.06-.137.317-.327.59-.57.82-.24.227-.529.403-.865.53-.334.127-.699.19-1.095.19-.23 0-.45-.025-.66-.075a3.218 3.218 0 0 1-.59-.19 3.521 3.521 0 0 1-.925-.62l.425-.58a.415.415 0 0 1 .35-.185.5.5 0 0 1 .265.08l.295.18c.11.063.238.122.385.175.146.053.325.08.535.08.216 0 .405-.035.565-.105a1.11 1.11 0 0 0 .395-.295c.106-.127.185-.275.235-.445.053-.173.08-.358.08-.555 0-.377-.109-.667-.325-.87-.214-.207-.525-.31-.935-.31a2.89 2.89 0 0 0-1.015.19l-.855-.24.61-3.57h3.64v.58a.75.75 0 0 1-.045.265.493.493 0 0 1-.14.205.686.686 0 0 1-.25.135c-.1.03-.224.045-.37.045H14.15l-.235 1.37Z"
                fill="#5D6066"
            />
        </svg>
    );
};

export default SVGFastForward15;
