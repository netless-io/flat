import "./style.less";

import React from "react";
import { Skeleton } from "antd";
import classNames from "classnames";

export interface CloudStorageSkeletonsProps {
    isCompactMode: boolean;
}

export const CloudStorageSkeletons: React.FC<CloudStorageSkeletonsProps> = ({ isCompactMode }) => {
    return (
        <div className="cloud-storage-skeletons">
            {Array(10)
                .fill(0)
                .map((_, i) => (
                    <div className="cloud-storage-skeletons-item" key={i}>
                        <div
                            className={classNames("cloud-storage-skeletons-item-icon", {
                                "cloud-storage-skeletons-item-icon-compact": isCompactMode,
                            })}
                        >
                            <Skeleton active title={false} paragraph={{ rows: 1, width: "100%" }} />
                        </div>
                        <div className="cloud-storage-skeletons-item-file">
                            <Skeleton active title={false} paragraph={{ rows: 1, width: "100%" }} />
                        </div>
                        <Skeleton active title={false} paragraph={{ rows: 1, width: "88%" }} />
                        <Skeleton active title={false} paragraph={{ rows: 1, width: "100%" }} />
                    </div>
                ))}
        </div>
    );
};
