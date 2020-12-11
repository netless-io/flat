import "./UserIndexPage.less";
import React from "react";
import MainPageLayout from "./components/MainPageLayout";
import { RouteComponentProps } from "react-router";
import { ipcAsyncByMain } from "./utils/Ipc";
import { MainRoomMenu } from "./components/MainRoomMenu";
import { MainRoomList } from "./components/MainRoomList";

class UserIndexPage extends React.Component<React.PropsWithChildren<RouteComponentProps>> {
    public render(): React.ReactNode {
        return (
            <MainPageLayout>
              <MainRoomMenu></MainRoomMenu>
              <MainRoomList></MainRoomList>
            </MainPageLayout>
        );
    }
}

export default UserIndexPage;
