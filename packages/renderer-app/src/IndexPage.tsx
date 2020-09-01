import * as React from "react";
import {Link, withRouter} from "react-router-dom"
import {RouteComponentProps} from "react-router";
import logo from "./assets/image/logo.svg";
import join from "./assets/image/join.svg";
import create from "./assets/image/create.svg";
import "./IndexPage.less";
import {Button, Input, Popover} from "antd";

export type IndexPageStates = {
    name: string;
    visible: boolean;
};

class IndexPage extends React.Component<RouteComponentProps<{}>, IndexPageStates> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        const name = localStorage.getItem("userName");
        this.state = {
            name: name ? name : "",
            visible: false,
        }
    }

    private handleCreate = (): void => {
        if (this.state.name) {
            this.props.history.push("/whiteboard/");
        } else {
            this.props.history.push("/name/");
        }
    }

    private updateName = (): void => {
        localStorage.setItem("userName", this.state.name);
        this.setState({visible: false});
    }
    public render(): React.ReactNode {
            return (
                <div className="page-index-box">
                    <div className="page-index-mid-box">
                        <div className="page-index-logo-box">
                            <img src={logo}/>
                            <Popover visible={this.state.visible} placement={"bottom"} trigger="click" content={
                                <div className="page-index-name-box" >
                                    <Input maxLength={8} onChange={e => this.setState({name: e.target.value})} value={this.state.name} style={{width: 120}} size={"small"}/>
                                    <Button onClick={this.updateName} style={{width: 120, marginTop: 12}} type={"primary"} size={"small"}>
                                        更新
                                    </Button>
                                </div>
                            } title={"编辑昵称"}>
                                <span onClick={() => this.setState({visible: true})}>
                                    <span style={{color: "#106BC5"}}>{this.state.name}</span>
                                    <span>欢迎使用 👋 </span>
                                </span>
                            </Popover>
                        </div>
                        <div className="page-index-start-box">
                            <div className="page-index-start-cell">
                                <Link to={"/join/"}>
                                    <img src={join}/>
                                </Link>
                                <span>加入房间</span>
                            </div>
                            <div className="page-cutline-box"/>
                            <div className="page-index-start-cell">
                                <div onClick={this.handleCreate}>
                                    <img src={create}/>
                                </div>
                                <span>创建房间</span>
                            </div>
                        </div>
                        <div className="page-index-link-box">
                            <div className="page-index-cell-left">
                                <a href={"https://netless.link/"} target={"_blank"}>官网</a>
                            </div>
                            <div className="page-cutline-link-box"/>
                            <div className="page-index-cell-right">
                                <a href={"https://github.com/netless-io/react-whiteboard"} target={"_blank"}>Github</a>
                            </div>
                        </div>
                        <div className="page-index-start-term">
                            本开源项目遵循<a href={"https://opensource.org/licenses/MIT"} target={"_blank"}>《 MIT 开源协议》</a>
                        </div>
                    </div>
                </div>
            );
    }
}

export default withRouter(IndexPage);