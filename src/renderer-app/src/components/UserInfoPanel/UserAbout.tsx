import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import logo from "../../assets/image/logo-large.svg";
import "./UserAbout.less";
import { observer } from "mobx-react-lite";
import { portalWindowManager } from "../../utils/portalWindowManager";
import { useParams } from "react-router";

export default observer(function UserAbout() {
    const params = useParams();

    const [containerEl] = useState(() => document.createElement("div"));
    useEffect(() => {
        portalWindowManager.createClassPortalWindow(window.location.href, "关于我们", containerEl);
    }, [containerEl]);

    return ReactDOM.createPortal(
        <div className="check-update-container">
            <span>当前参数: {JSON.stringify(params)}</span>
            <div className="check-update-logo">
                <img src={logo} alt="flat web logo" />
                <div className="check-update-info">
                    <a>服务协议</a>
                    <span>|</span>
                    <a>隐私政策</a>
                </div>
            </div>
            <div className="check-update-footer">
                © 2020 沪 ICP 备 14053584 号 上海兆言网络科技有限公司
            </div>
        </div>,
        containerEl,
    );
});

// export default class UserAbout extends React.PureComponent {
//     public render(): JSX.Element {
//         return ReactDOM.createPortal(
//             <div className="check-update-container">
//                 <div className="check-update-logo">
//                     <img src={logo} alt="flat web logo" />
//                     <div className="check-update-info">
//                         <a>服务协议</a>
//                         <span>|</span>
//                         <a>隐私政策</a>
//                     </div>
//                 </div>
//                 <div className="check-update-footer">
//                     © 2020 沪 ICP 备 14053584 号 上海兆言网络科技有限公司
//                 </div>
//             </div>,
//         );
//     }
// }
