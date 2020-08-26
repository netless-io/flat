import * as React from "react";
import "./PageError.less";
import room_not_find from "./assets/image/room_not_find.svg";

export default class PageError extends React.Component<{}, {}> {
    public constructor(props: {}) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <div className="page404-box">
                <div className="page404-image-box">
                    <img className="page404-image-inner" src={room_not_find} />
                    <div className="page404-inner">您访问的页面不存在</div>
                </div>
            </div>
        );
    }
}
