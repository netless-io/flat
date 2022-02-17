import "./style.less";

import React from "react";
import { Skeleton } from "antd";

export const RoomListSkeletons: React.FC = () => {
    return (
        <div className="room-list-skeletons">
            {Array(4)
                .fill(0)
                .map((_, i) => (
                    <Skeleton
                        key={i}
                        active
                        paragraph={{ rows: 4, width: ["13%", "50%", "13%", "13%"] }}
                        title={false}
                    />
                ))}
        </div>
    );
};
