import React from "react"
import { MainRoomMenu } from "./components/MainRoomMenu"
import MainPageLayout from "./components/MainPageLayout"

export default class UserInfoPage extends React.PureComponent<{}> {
    public render() {
        return (
            <MainPageLayout>
                <MainRoomMenu></MainRoomMenu>
            </MainPageLayout>
        )
    }
}