import "./style.less";
import React from "react";
import classNames from "classnames";

export interface RoomListLabelProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
    type?: "default" | "success" | "primary" | "warning";
}

export const RoomListLabel: React.FC<RoomListLabelProps> = ({
    children,
    type = "default",
    className,
    ...restProps
}) => {
    return (
        <span
            {...restProps}
            className={classNames(
                "room-list-label",
                type ? `room-list-label-${type}` : null,
                className,
            )}
        >
            {children}
        </span>
    );
};
