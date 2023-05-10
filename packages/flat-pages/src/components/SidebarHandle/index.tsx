import "./style.less";

import React from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";

import { ClassroomStore } from "@netless/flat-stores";

export interface SidebarHandleProps {
    classroom: ClassroomStore;
}

export const SidebarHandler = observer<SidebarHandleProps>(function SidebarHandle({ classroom }) {
    const whiteboard = classroom.whiteboardStore;

    const collapsed = whiteboard.isRightSideClose;

    return (
        <label className={classNames("sidebar-handler", { collapsed })}>
            <input
                checked={collapsed}
                type="checkbox"
                onChange={() => whiteboard.setRightSideClose(!collapsed)}
            />
            <svg fill="none" height="42" viewBox="0 0 17 42" width="17">
                <path
                    className="sidebar-handler-border-color sidebar-handler-bg-color"
                    d="M17.0 41.0H5.0C2.7909 41.0 1.0 39.2091 1.0 37.0V5.0C1.0 2.79086 2.7909 1.0 5.0 1.0H17.0"
                    fill="#fff"
                    stroke="#000"
                />
                {collapsed ? (
                    <path
                        className="sidebar-handler-image-fill-color"
                        clipRule="evenodd"
                        d="M8 19L10 17V25L8 23L6 21L8 19ZM12 17H11V25H12V17Z"
                        fill="#fff"
                        fillRule="evenodd"
                    />
                ) : (
                    <path
                        className="sidebar-handler-image-fill-color"
                        clipRule="evenodd"
                        d="M10 19L8 17V25L10 23L12 21L10 19ZM6 17H7V25H6V17Z"
                        fill="#fff"
                        fillRule="evenodd"
                    />
                )}
            </svg>
        </label>
    );
});
