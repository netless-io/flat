import "./UserIndexPage.less";
import React from "react";
import MainPageLayout from "./components/MainPageLayout";
import { RouteComponentProps } from "react-router";
import { ipcAsyncByMain } from "./utils/Ipc";
import { MainRoomMenu } from "./components/MainRoomMenu";
import { MainRoomList } from "./components/MainRoomList";

class UserIndexPage extends React.Component<React.PropsWithChildren<RouteComponentProps>> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        this.state = {};
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 668,
        });
    }

    public render(): React.ReactNode {
        const location = this.props.location;
        const key = location.hash.replace(/^#/, "");
        console.log(key);
        return (
            <MainPageLayout>
              <MainRoomMenu></MainRoomMenu>
              <MainRoomList></MainRoomList>
            </MainPageLayout>
        );
    }
}

export default UserIndexPage;
