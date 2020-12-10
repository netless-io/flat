import React from "react";
import "./MainRoomMenu.less"
import { Button } from "antd";
import join from "../assets/image/join.svg";
import create from "../assets/image/creat.svg";
import book from "../assets/image/book.svg";

export class MainRoomMenu extends React.PureComponent<{}> {
    public render() {
        return (
            <div className="content-header-container">
                <Button className="header-container-btn">
                    <img src={join} alt="join room"/>
                    加入房间
                </Button>
                <Button className="header-container-btn">
                    <img src={create} alt="create room" />
                    创建房间
                </Button>
                <Button className="header-container-btn">
                    <img src={book} alt="book room" />
                    预定房间
                </Button>
            </div>
        );
    }
}
