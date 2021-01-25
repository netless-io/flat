import React from "react";
import { Select, Slider, Button } from "antd";
import { Link } from "react-router-dom";

export const MicrophoneTesting = (): React.ReactElement => {
    return (
        <div className="content-container">
            <div className="header-container">
                <span>麦克风检测</span>
            </div>
            <div className="speaker-testing-container">
                <p>麦克风</p>
                <Select defaultValue="MacBook Pro 麦克风">
                    <Select.Option value="cheerchen">MacBook Pro 麦克风</Select.Option>
                </Select>
                {/* TODO  MicrophoneTesting*/}
                <p>试听声音</p>
                <div className="speaker-audio-testing">
                    <p>音量</p>
                    <Slider defaultValue={30} />
                </div>
                <div className="testing-btn">
                    <Button>
                        <Link to="/setting/microphone/">不可以听到</Link>
                    </Button>
                    <Button type="primary">
                        <Link to="/setting/microphone/">可以听到</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
