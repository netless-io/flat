import React from "react";
import "./SystemTesting.less";
import { Button } from "antd";
import { Link } from "react-router-dom";

export const SystemTesting = (): React.ReactElement => {
    return (
        <div className="content-container">
            <div className="header-container">
                <span>系统检测</span>
            </div>
            <div className="system-info-container">
                <div className="system-title-info">
                    <span>操作系统</span>
                    <span>处理器(CPU)</span>
                    <span>缓存可用空间</span>
                    <span>网络延时</span>
                    <span>丢包率</span>
                </div>
                <div className="system-value-info">
                    <span>macOS</span>
                    <span>AMD5900X</span>
                    <span>1121MB</span>
                    <span>21ms</span>
                    <span>2%</span>
                    <Button type="primary">
                        <Link to="/setting/camera/">下一步</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
