import React from "react"
import Checkbox from "antd/lib/checkbox/Checkbox"
import "./FileSetting.less"
import { Input, Button } from "antd"

export default class FileSetting extends React.PureComponent<{}> {
    public render() {
        return (
            <div className="content-container">
                <div className="header-container">
                    <span>文件设置</span>
                </div>
                <div className="cache-container">
                    <div className="inner-cache">
                    <Checkbox>缓存所有课件</Checkbox>
                        <p>把缓存文件保存至</p>
                        <Input type="file"></Input> 
                        <Button>打开文件夹</Button>
                    </div>
                        <p>目前有 77.77 MB 缓存文件</p>
                        <Button>清理缓存</Button>
                </div>
            </div>
        )
    }
}