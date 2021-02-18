import React from "react";
import loading from "./assets/image/loading.gif";
import "./LoadingPage.less";
export type LoadingPageProps = {
    text?: string;
};

export default class LoadingPage extends React.Component<LoadingPageProps, {}> {
    public render(): React.ReactNode {
        return (
            <div className="white-board-loading">
                <div className="white-board-loading-mid">
                    <img src={loading} alt={"loading"} />
                    {this.props.text ? <div>{this.props.text}</div> : null}
                </div>
            </div>
        );
    }
}
