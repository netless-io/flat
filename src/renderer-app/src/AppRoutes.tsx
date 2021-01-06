import React from "react";
import { HashRouter } from "react-router-dom";
import { Route, Switch } from "react-router";
import { message } from "antd";
import WhiteboardCreatorPage from "./WhiteboardCreatorPage";
import ReplayPage from "./ReplayPage";
import JoinPage from "./JoinPage";
import AddNamePage from "./AddNamePage";
import Test from "./Test";
import Storage from "./Storage";
import HistoryPage from "./HistoryPage";
import CreatePage from "./CreatePage";
import UserIndexPage from "./UserIndexPage";
import UserInfoPage from "./UserInfoPage";
import UserSetPage from "./UserSetPage";
import UserScheduledPage from "./UserScheduledPage";
import RoomDetailPage from "./RoomDetailPage";
import LoginPage from "./LoginPage";
import IndexPage from "./IndexPage";
import SmallClassPage from "./pages/SmallClassPage";
import BigClassPage from "./pages/BigClassPage";

export class AppRoutes extends React.Component<{}, {}> {
    public componentDidCatch(error: any): void {
        message.error(`网页加载发生错误：${error}`);
    }
    public render(): React.ReactNode {
        return (
            <HashRouter>
                <Switch>
                    <Route exact path="/replay/:identity/:uuid/:userId/" component={ReplayPage} />
                    <Route
                        exact
                        path="/SmallClass/:identity/:uuid/:userId/"
                        component={SmallClassPage}
                    />
                    <Route
                        exact
                        path="/BigClass/:identity/:uuid/:userId/"
                        component={BigClassPage}
                    />
                    <Route
                        exact
                        path="/whiteboard/:identity/:uuid?/"
                        component={WhiteboardCreatorPage}
                    />
                    <Route exact path="/join/" component={JoinPage} />
                    <Route exact path="/name/:uuid?/" component={AddNamePage} />
                    <Route exact path="/test/" component={Test} />
                    <Route exact path="/create/" component={CreatePage} />
                    <Route exact path="/storage/" component={Storage} />
                    <Route exact path="/history/" component={HistoryPage} />
                    <Route exact path="/" component={IndexPage} />
                    <Route exact path="/login/" component={LoginPage} />
                    <Route exact path="/user/" component={UserIndexPage} />
                    <Route exact path="/user/scheduled/" component={UserScheduledPage} />
                    <Route exact path="/user/room/:uuid/" component={RoomDetailPage} />
                    <Route exact path="/info/" component={UserInfoPage} />
                    <Route path="/setting/" component={UserSetPage} />
                </Switch>
            </HashRouter>
        );
    }
}
