import * as React from "react";
import loading from "./assets/image/loading.svg";
import "./LoadingPage.less";
export type LoadingPageProps = {
    text?: string;
};

export default class LoadingPage extends React.Component<LoadingPageProps, {}> {
    public constructor(props: LoadingPageProps) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <div className="white-board-loading">
                <div className="white-board-loading-mid">
                    <img src={loading} />
                    {this.props.text ? <div>{this.props.text}</div> : null}
                </div>
            </div>
        );
    }
}
