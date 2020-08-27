import React, { useRef } from "react";
import { Button } from "antd";
import { Rtc } from "./rtc";

export default function a() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ref = useRef(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const remoteRef = useRef(null);
    const rtc = new Rtc();

    const handleJoin = () => {
        console.log("asdasd");
        rtc.join("test", ref.current);
    };
    const handleLeave = () => {
        rtc.leave();
    };
    return (
        <div className="App">
            <h1>Title</h1>
            <div ref={ref}></div>
            <div ref={remoteRef}></div>
            <Button onClick={handleJoin}>join</Button>
            <Button onClick={handleLeave}>leave</Button>
        </div>
    );
}
