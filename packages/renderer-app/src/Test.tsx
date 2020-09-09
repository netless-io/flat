import * as React from "react";
import { Button } from "antd";

export default class Test extends React.Component<{}, {}> {
    public render(): React.ReactNode {
        return (
            <div className="page-index-box">
                <Button>点击下载</Button>
                <div>下载百分比 100%</div>
                https://white-sdk.oss-cn-beijing.aliyuncs.com/images/test.zip
            </div>
        );
    }
}
