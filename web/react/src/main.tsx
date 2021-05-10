import "./style.less";

import React from "react";
import ReactDOM from "react-dom";
import { WhiteVersion } from "white-web-sdk";
import { VERSION } from "agora-rtc-sdk"

function App(): React.ReactElement {
    return <>
        <pre className="pt2 pl4">
            using white-web-sdk@{WhiteVersion}<br />
            using agora-rtc-sdk@{VERSION}
        </pre>
    </>;
}

ReactDOM.render(<App />, document.getElementById("app"));
