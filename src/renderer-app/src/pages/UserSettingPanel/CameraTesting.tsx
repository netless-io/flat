import React from "react";
import "./CameraTesting.less";
import { Select, Button } from "antd";
import { Link } from "react-router-dom";

export const CameraTesting = (): React.ReactElement => {
    return (
        <div className="content-container">
            <div className="header-container">
                <span>摄像头检测</span>
            </div>
            <div className="camera-container">
                <p>摄像头</p>
                <Select defaultValue="FaceTime HD Camera">
                    {/* TODO take value enum */}
                    <Select.Option value="cheerego">FaceTime HD Camera</Select.Option>
                </Select>
                {/* TODO camer video testing */}
                <div className="camera-info"></div>
                <div className="testing-btn">
                    <Button>不可以看到</Button>
                    <Button type="primary">
                        <Link to="/setting/speaker/">可以看到</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
