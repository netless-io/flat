import * as React from "react";
import "./Storage.less";
import * as zip_icon from "./assets/image/zip.svg";
import "@netless/zip";
import { pptDatas } from "./pptDatas";
import { WhiteScene } from "white-web-sdk";
import { Button, Progress, Tag } from "antd";
import { Link } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";
import empty_box from "./assets/image/empty-box.svg";

export type ServiceWorkTestStates = {
    space: number;
    availableSpace: number;
    pptDatas: string[];
    pptDatasStates: PptDatasType[];
};

export type PptDatasType = {
    taskUuid: string | null;
    progress: number;
    cover: string;
    isDownload: boolean;
};

export default class Storage extends React.Component<{}, ServiceWorkTestStates> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            space: 0,
            availableSpace: 0,
            pptDatas: pptDatas,
            pptDatasStates: [],
        };
    }

    public async componentDidMount(): Promise<void> {
        await this.refreshSpaceData();
        const pptDatasStates: PptDatasType[] = await Promise.all(
            pptDatas.map(async ppt => {
                const scenes: WhiteScene[] = JSON.parse(ppt);
                let cover = zip_icon;
                if (scenes[0] && scenes[0].ppt) {
                    if (scenes[0].ppt.previewURL) {
                        cover = scenes[0].ppt.previewURL;
                    }
                    const regex = /dynamicConvert\/([^\/]+)/gm;
                    const inner = scenes[0].ppt.src.match(regex);
                    if (inner) {
                        const taskUuid = inner[0].replace("dynamicConvert/", "");
                        return {
                            taskUuid: taskUuid,
                            progress: 0,
                            cover: cover,
                            isDownload: false, // TODO
                        };
                    } else {
                        return {
                            taskUuid: null,
                            progress: 0,
                            cover: cover,
                            isDownload: false,
                        };
                    }
                } else {
                    return {
                        taskUuid: null,
                        progress: 0,
                        cover: cover,
                        isDownload: false,
                    };
                }
            }),
        );
        this.setState({ pptDatasStates: pptDatasStates });
    }

    private refreshSpaceData = async (): Promise<void> => {
        const space = 0; // TODO;
        const availableSpace = 0; // TODO;
        this.setState({ space: Math.round(space), availableSpace: Math.round(availableSpace) });
    };

    private renderZipCells = (): React.ReactNode => {
        const { pptDatasStates } = this.state;
        return pptDatasStates.map((pptData, index: number) => {
            if (pptData.taskUuid !== null) {
                return (
                    <div key={`zip-${index}`}>
                        <div className="room-cell-box">
                            <div className="room-cell-left">
                                <div className="room-cell-image">
                                    <img src={pptData.cover} alt={"cover"} />
                                    {!pptData.isDownload && (
                                        <div className="room-cell-image-cover">
                                            <Progress
                                                width={42}
                                                style={{ color: "white" }}
                                                strokeWidth={6}
                                                type="circle"
                                                trailColor={"white"}
                                                percent={pptData.progress}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="room-download-cell-right">
                                <Button
                                    onClick={() => this.downloadCell(pptData.taskUuid!)}
                                    type={"primary"}
                                    disabled={pptData.isDownload}
                                    style={{ width: 96 }}
                                >
                                    下载
                                </Button>
                                <Button
                                    onClick={() => this.deleteCell(pptData.taskUuid!)}
                                    disabled={!pptData.isDownload}
                                    style={{ width: 96 }}
                                >
                                    删除
                                </Button>
                            </div>
                        </div>
                        <div className="room-cell-cut-line" />
                    </div>
                );
            }
            return null;
        });
    };

    private deleteCell = async (taskUuid: string): Promise<void> => {
        // TODO
        // await netlessCaches.deleteTaskUUID(taskUuid);
        await this.refreshSpaceData();
        const pptDatasStates = this.state.pptDatasStates.map(pptData => {
            if (pptData.taskUuid === taskUuid) {
                pptData.progress = 0;
                pptData.isDownload = false;
                return pptData;
            } else {
                return pptData;
            }
        });
        this.setState({ pptDatasStates: pptDatasStates });
    };

    private downloadCell = async (taskUuid: string): Promise<void> => {
        console.log(taskUuid);
        // TODO
        // await netlessCaches.startDownload(taskUuid, (progress: number) => {
        //     const pptDatasStates = this.state.pptDatasStates.map(pptData => {
        //         if (pptData.taskUuid === taskUuid) {
        //             pptData.progress = progress;
        //             if (pptData.progress === 100) {
        //                 pptData.progress = 0;
        //                 pptData.isDownload = true;
        //                 return pptData;
        //             } else {
        //                 return pptData;
        //             }
        //         } else {
        //             return pptData;
        //         }
        //     });
        //     this.setState({ pptDatasStates: pptDatasStates });
        // });
        await this.refreshSpaceData();
    };

    private downloadAllCell = async (): Promise<void> => {
        const { pptDatasStates } = this.state;
        for (let ppt of pptDatasStates) {
            if (ppt.taskUuid && !ppt.isDownload) {
                // TODO
                // await netlessCaches.startDownload(ppt.taskUuid, (progress: number) => {
                //     const pptDatasStates = this.state.pptDatasStates.map(pptData => {
                //         if (pptData.taskUuid === ppt.taskUuid) {
                //             pptData.progress = progress;
                //             if (pptData.progress === 100) {
                //                 pptData.progress = 0;
                //                 pptData.isDownload = true;
                //                 return pptData;
                //             } else {
                //                 return pptData;
                //             }
                //         } else {
                //             return pptData;
                //         }
                //     });
                //     this.setState({ pptDatasStates: pptDatasStates });
                // });
                await this.refreshSpaceData();
            }
        }
    };

    private clearSpace = async (): Promise<void> => {
        // TODO
        // await netlessCaches.deleteCache();
        const pptDatasStates = this.state.pptDatasStates.map(pptData => {
            pptData.isDownload = false;
            pptData.progress = 0;
            return pptData;
        });
        this.setState({ pptDatasStates: pptDatasStates });
        await this.refreshSpaceData();
    };

    public render(): React.ReactNode {
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-history-head">
                        <div className="page-history-head-left">
                            <Link to={"/"}>
                                <div className="page-history-back">
                                    <LeftOutlined /> <div>返回</div>
                                </div>
                            </Link>
                            <Tag color={"blue"} style={{ marginLeft: 8 }}>
                                {this.state.space}(mb) / {this.state.availableSpace}(mb)
                            </Tag>
                        </div>
                        <div>
                            <Button
                                type="link"
                                size={"small"}
                                style={{ marginRight: 20, fontSize: 14 }}
                                onClick={this.downloadAllCell}
                            >
                                全部下载
                            </Button>
                            <Button
                                type="link"
                                size={"small"}
                                style={{ marginRight: 20, fontSize: 14 }}
                                onClick={this.clearSpace}
                            >
                                清空缓存
                            </Button>
                        </div>
                    </div>
                    {this.state.pptDatas.length === 0 ? (
                        <div className="page-history-body-empty">
                            <img src={empty_box} alt={"empty_box"} />
                        </div>
                    ) : (
                        <div className="page-history-body">{this.renderZipCells()}</div>
                    )}
                </div>
            </div>
        );
    }
}
