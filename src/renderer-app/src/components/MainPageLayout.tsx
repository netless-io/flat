import React from "react"
import "./MainPageLayout.less"
import { MainMenu } from "./MainMenu"
import { MainHeader } from "./MainHeader"
import { MainRoomMenu } from "./MainRoomMenu"

export type MainPageLayoutProps = {

}

export default class MainPageLayout extends React.PureComponent<MainPageLayoutProps> {
  public render() {
    return (
      <div className="layout-container">
        <div className="layout-container-menu">
          <MainMenu/>
        </div>
        <div className="layout-container-content">
          <div className="layout-container-header">
            <MainHeader/>
          </div>
          {this.props.children}
        </div>
      </div>
    )
  }
}
