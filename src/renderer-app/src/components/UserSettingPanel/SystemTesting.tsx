import React from "react"
import "./SystemTesting.less"
import { Button } from "antd";
import { Link } from "react-router-dom";
export default class SystemTesting extends React.PureComponent<{}> {
    public render() {
        return (
            <div className="content-container">
                <div className="header-container">
                    <span>系统检测</span>
                </div>
                <div className="system-info-container">
                    <div className="system-title-info">
                        <span>微信账号</span>
                        <span>昵称</span>
                        <span>操作系统</span>
                        <span>处理器(CPU)</span>
                        <span>缓存可用空间</span>
                        <span>网络延时</span>
                        <span>丢包率</span>
                        <span>服务器</span>
                        <span>客户端</span>
                        <span>CDN</span>
                    </div>
                    <div className="system-value-info">
                        <span>Cheerego</span>
                        <span>陈绮贞</span>
                        <span>macOS</span>
                        <span>AMD5900X</span>
                        <span>1121MB</span>
                        <span>21ms</span>
                        <span>2%</span>
                        <span>AQCS310(Auto)</span>
                        <span>114.198.14.19</span>
                        <span>CST0S112.246.3.201/CDT0S122.198.3.22</span>
                        <Button type="primary">
                            <Link to="/setting/camera/">下一步</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}