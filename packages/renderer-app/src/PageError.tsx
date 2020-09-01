import * as React from "react";
import "./PageError.less";
import room_not_find from "./assets/image/room_not_find.svg";
import {Button} from "antd";
import {Link} from "react-router-dom";

export default class PageError extends React.Component<{}, {}> {
    public constructor(props: {}) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <div className="page404-box">
                <div className="page404-image-box">
                    <img className="page404-image-inner" src={room_not_find}/>
                    <div className="page404-inner">
                        <div className="page404-inner-title">
                            抱歉，您要访问的页面不存在
                        </div>
                        <div className="page404-inner-script">
                            可能是链接地址有误，页面已经被移除或者隐藏
                        </div>
                        <Link to={"/"}>
                            <Button size={"large"} style={{width: 118}}>
                                返回首页
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
