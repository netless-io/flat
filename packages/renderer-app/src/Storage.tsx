import * as React from "react";
import "./Storage.less";
import zip_icon from "./assets/image/zip.svg";
import { taskUuids, TaskUuidType } from "./taskUuids";
import { Button, Progress } from "antd";
import { Link } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";
import empty_box from "./assets/image/empty-box.svg";
import { DownloadFile } from "./utils/download";
import { extractZIP } from "./utils/unzip";
import { removeSync } from "fs-extra";
const resourcesHost = "convertcdn.netless.link";
export type ServiceWorkTestStates = {
    pptDatas: TaskUuidType[];
    pptDatasStates: PptDatasType[];
};

export type PptDatasType = {
    taskUuid: string | null;
    progress: number;
    cover: string;
    name: string;
    isDownload: boolean;
};

export default class Storage extends React.Component<{}, ServiceWorkTestStates> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            pptDatas: taskUuids,
            pptDatasStates: [],
        };
    }

    public async componentDidMount(): Promise<void> {
        const pptDatasStates: PptDatasType[] = await Promise.all(
            taskUuids.map(async ppt => {
                const zipUrl = this.getZipUrlByTaskUuid(ppt.taskUuid);
                const download = new DownloadFile(zipUrl);
                return {
                    taskUuid: ppt.taskUuid,
                    progress: 0,
                    name: ppt.name ? ppt.name : "",
                    cover: zip_icon,
                    isDownload: download.fileIsExists(ppt.taskUuid),
                };
            }),
        );
        this.setState({ pptDatasStates: pptDatasStates });
    }

    private noticeDownloadZip = (taskUuid: string): void => {
        const zipUrl = this.getZipUrlByTaskUuid(taskUuid);
        const download = new DownloadFile(zipUrl);
        download.onProgress(p => {
            const pptDatasStates = this.state.pptDatasStates.map(pptData => {
                if (pptData.taskUuid === taskUuid) {
                    pptData.progress = p.progress;
                    return pptData;
                } else {
                    return pptData;
                }
            });
            this.setState({ pptDatasStates: pptDatasStates });
        });

        download.onEnd(d => {
            extractZIP(d.filePath, taskUuid)
                .then(() => {
                    removeSync(d.filePath);
                    const pptDatasStates = this.state.pptDatasStates.map(pptData => {
                        if (pptData.taskUuid === taskUuid) {
                            pptData.isDownload = true;
                            return pptData;
                        } else {
                            return pptData;
                        }
                    });
                    this.setState({ pptDatasStates: pptDatasStates });
                })
                .catch(e => {
                    console.log("解压失败");
                    console.log(e);
                });
        });

        download.onError(e => {
            console.error("下载失败");
            console.error(e);
        });

        console.log(`文件是否已经存在: ${download.fileIsExists("test.zip")}`);
        download.start();
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
                                    onClick={() => this.noticeDownloadZip(pptData.taskUuid!)}
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
        removeSync(taskUuid);
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

    private getZipUrlByTaskUuid = (taskUuid: string): string => {
        return `https://${resourcesHost}/dynamicConvert/${taskUuid}.zip`;
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
