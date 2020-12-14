import "./UserSetPage.less";
import React from "react";
import MainPageLayout from "./components/MainPageLayout";
import { RouteComponentProps } from "react-router";
import { ipcAsyncByMain } from "./utils/Ipc";
import { MainRoomMenu } from "./components/MainRoomMenu";
import { MainRoomList } from "./components/MainRoomList";

export default class UserSetPage extends React.Component<React.PropsWithChildren<RouteComponentProps>> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
    }

    public componentDidMount() {
      ipcAsyncByMain("set-win-size", {
        width: 1200,
        height: 668,
      });
    }

    public render(): React.ReactNode {
        return (
            <MainPageLayout>
              123
            </MainPageLayout>
        );
    }
}
