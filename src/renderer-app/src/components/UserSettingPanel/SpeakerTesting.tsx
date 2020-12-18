import React from "react"
import { Select, Slider, Button } from "antd"
import "./SpeakerTesting.less"
import { Link } from "react-router-dom";
import play from "../../assets/image/play.svg"
import stop from "../../assets/image/stop.svg"

export default class SpeakerTesting extends React.PureComponent<{}> {
    public render() {
        const { Option } = Select;
        return (
            <div className="content-container">
                <div className="header-container">
                    <span>扬声器检测</span>
                </div>
                <div className="speaker-testing-container">
                    <div className="speaker-container">
                        <p>扬声器</p>
                        <Select defaultValue="default(外置耳机)">
                            {/* TODO take value enum */}
                            <Option value="cheerego">Cheerego</Option>
                        </Select>
                        <p>试听声音</p>
                        {/* TODO music testing */}
                        <Button icon={<img src={play}/>}>
                            <audio src="/media/cc0-audio/t-rex-roar.mp3"></audio>
                            小步舞曲.mp3
                        </Button>
                    </div>
                    <div className="speaker-audio-testing">
                        <p>音量</p>
                        <Slider defaultValue={30}></Slider>
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
        )
    }
}