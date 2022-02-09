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
                    <div key={i} className="cloud-storage-skeletons-item">
                        <div className="cloud-storage-skeletons-item-icon">
                            <Skeleton active paragraph={{ rows: 1, width: "100%" }} title={false} />
                        </div>
                        <div
                            className={classNames("cloud-storage-skeletons-item-file", {
                                "cloud-storage-skeletons-item-file-compact": isCompactMode,
                            })}
                        >
                            <Skeleton active paragraph={{ rows: 1, width: "100%" }} title={false} />
                        </div>
                        <div className="cloud-storage-skeletons-item-file-size">
                            <Skeleton active paragraph={{ rows: 1, width: "100%" }} title={false} />
                        </div>
                        <div className="cloud-storage-skeletons-item-file-date">
                            <Skeleton active paragraph={{ rows: 1, width: "100%" }} title={false} />
                        </div>
                    </div>
                ))}
        </div>
    );
};
