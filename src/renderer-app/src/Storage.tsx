import React from "react";
import "./Storage.less";
import zip_icon from "./assets/image/zip.svg";
import { taskUuids, TaskUuidType } from "./taskUuids";
import { Button, Progress } from "antd";
import { Link } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";
import empty_box from "./assets/image/empty-box.svg";
import { DownloadFile } from "./utils/Download";
import { extractZIP } from "./utils/Unzip";
import { copySync, removeSync } from "fs-extra";
import { runtime } from "./utils/Runtime";
import path from "path";
const resourcesHost = "convertcdn.netless.link";
export type ServiceWorkTestStates = {
    pptDatas: TaskUuidType[];
    pptDatasStates: PptDatasType[];
    downloader: Downloader | null;
    downloadAllState: DownloadState;
};

export type PptDatasType = {
    taskUuid: string | null;
    progress: number;
    cover: string;
    name: string;
    downloadState: DownloadState;
};

enum DownloadState {
    preDownload = "preDownload",
    downloading = "downloading",
    stopDownload = "stopDownload",
    downloaded = "downloaded",
}

enum PptListState {
    listDownAll = "listDownAll",
    listDownPart = "listDownPart",
    listDownNone = "listDownNone",
}

export default class Storage extends React.Component<{}, ServiceWorkTestStates> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            pptDatas: taskUuids,
            pptDatasStates: [],
            downloader: null,
            downloadAllState: DownloadState.preDownload,
        };
    }

    public async componentDidMount(): Promise<void> {
        const pptDatasStates: PptDatasType[] = taskUuids.map(ppt => {
            const url = this.getZipUrlByTaskUuid(ppt.taskUuid);
            const download = new DownloadFile(url);
            if (download.fileIsExists(path.join("dynamicConvert", ppt.taskUuid))) {
                return {
                    taskUuid: ppt.taskUuid,
                    progress: 0,
                    name: ppt.name ? ppt.name : "",
                    cover: zip_icon,
                    downloadState: DownloadState.downloaded,
                };
            } else {
                return {
                    taskUuid: ppt.taskUuid,
                    progress: 0,
                    name: ppt.name ? ppt.name : "",
                    cover: zip_icon,
                    downloadState: DownloadState.preDownload,
                };
            }
        });
        const downloader = new Downloader(pptDatasStates, this.onProgressUpdate, this.onPptSuccess);
        this.setState({ downloader: downloader, pptDatasStates: pptDatasStates });
    }

    private onProgressUpdate = (pptDatasStates: PptDatasType[]): void => {
        this.setState({ pptDatasStates: pptDatasStates });
    };

    private onPptSuccess = async (): Promise<void> => {
        // await this.refreshSpaceData();
    };

    private noticeDownloadZip = (taskUuid: string): void => {
        const zipUrl = this.getZipUrlByTaskUuid(taskUuid);
        const downloadDir = path.join(runtime.downloadsDirectory, "dynamicConvert", taskUuid);
        const download = new DownloadFile(zipUrl, downloadDir);
        download.onProgress(p => {
            const progress = Math.round(p.progress);
            const pptDatasStates = this.state.pptDatasStates.map(pptData => {
                if (pptData.taskUuid === taskUuid) {
                    pptData.progress = progress;
                    return pptData;
                } else {
                    return pptData;
                }
            });
            this.setState({ pptDatasStates: pptDatasStates });
        });
        download.onEnd(d => {
            extractZIP(d.filePath, downloadDir)
                .then(() => {
                    removeSync(d.filePath);
                    copySync(
                        path.join(runtime.downloadsDirectory, "dynamicConvert", taskUuid, taskUuid),
                        downloadDir,
                    );
                    removeSync(
                        path.join(runtime.downloadsDirectory, "dynamicConvert", taskUuid, taskUuid),
                    );
                    const pptDatasStates = this.state.pptDatasStates.map(pptData => {
                        if (pptData.taskUuid === taskUuid) {
                            pptData.downloadState = DownloadState.downloaded;
                        }
                        return pptData;
                    });
                    this.setState({ pptDatasStates: pptDatasStates });
                })
                .catch(e => {
                    console.log("解压失败", e);
                });
        });
        download.onError(e => {
            console.error("下载失败", e);
        });
        download.start();
    };

    private detectIsDownload = (ppt: PptDatasType): boolean => {
        return ppt.downloadState === DownloadState.downloaded;
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
                                    {!this.detectIsDownload(pptData) && (
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
                                    disabled={this.detectIsDownload(pptData)}
                                    style={{ width: 96 }}
                                >
                                    下载
                                </Button>
                                <Button
                                    onClick={() => this.deleteCell(pptData.taskUuid!)}
                                    disabled={!this.detectIsDownload(pptData)}
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
        removeSync(path.join(runtime.downloadsDirectory, "dynamicConvert", taskUuid));
        const pptDatasStates = this.state.pptDatasStates.map(pptData => {
            if (pptData.taskUuid === taskUuid) {
                pptData.progress = 0;
                pptData.downloadState = DownloadState.preDownload;
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
        const { downloader } = this.state;
        if (downloader) {
            this.setState({ downloadAllState: DownloadState.downloading });
            await downloader.downloadAll();
            this.refreshPptListState();
        }
    };
    private refreshPptListState = (): void => {
        const { downloader } = this.state;
        if (downloader) {
            if (downloader.pptListState === PptListState.listDownAll) {
                this.setState({ downloadAllState: DownloadState.downloaded });
            } else if (downloader.pptListState === PptListState.listDownPart) {
                this.setState({ downloadAllState: DownloadState.stopDownload });
            } else {
                this.setState({ downloadAllState: DownloadState.preDownload });
            }
        }
    };
    private clearSpace = async (): Promise<void> => {
        removeSync(runtime.downloadsDirectory);
        const pptDatasStates = this.state.pptDatasStates.map(pptData => {
            pptData.downloadState = DownloadState.preDownload;
            pptData.progress = 0;
            return pptData;
        });
        this.setState({
            pptDatasStates: pptDatasStates,
            downloadAllState: DownloadState.preDownload,
        });
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
class Downloader {
    private didStop: boolean = false;
    private readonly pptDatasStates: PptDatasType[];
    private readonly onProgressUpdate: (pptDatasStates: PptDatasType[]) => void;
    private readonly onPptSuccess: () => Promise<void>;
    public pptListState: PptListState;
    public constructor(
        pptDatasStates: PptDatasType[],
        onProgressUpdate: (pptDatasStates: PptDatasType[]) => void,
        onPptSuccess: () => Promise<void>,
    ) {
        this.pptDatasStates = pptDatasStates;
        this.onProgressUpdate = onProgressUpdate;
        this.onPptSuccess = onPptSuccess;
        this.pptListState = this.getPptListState();
    }
    public stop = (): void => {
        this.didStop = true;
    };

    public start = (): void => {
        this.didStop = false;
    };

    private getZipUrlByTaskUuid = (taskUuid: string): string => {
        return `https://${resourcesHost}/dynamicConvert/${taskUuid}.zip`;
    };

    private download = async (taskUuid: string): Promise<void> => {
        const zipUrl = this.getZipUrlByTaskUuid(taskUuid);
        const downloadDir = path.join(runtime.downloadsDirectory, "dynamicConvert", taskUuid);
        const download = new DownloadFile(zipUrl, downloadDir);
        download.onProgress(progressObj => {
            const progress = Math.round(progressObj.progress);
            const pptDatasStates = this.pptDatasStates.map(pptData => {
                if (pptData.taskUuid === taskUuid) {
                    pptData.progress = progress;
                    pptData.downloadState = DownloadState.downloading;
                    return pptData;
                } else {
                    return pptData;
                }
            });
            this.onProgressUpdate(pptDatasStates);
        });
        download.onEnd(d => {
            extractZIP(d.filePath, downloadDir)
                .then(() => {
                    removeSync(d.filePath);
                    copySync(
                        path.join(runtime.downloadsDirectory, "dynamicConvert", taskUuid, taskUuid),
                        downloadDir,
                    );
                    removeSync(
                        path.join(runtime.downloadsDirectory, "dynamicConvert", taskUuid, taskUuid),
                    );
                    const pptDatasStates = this.pptDatasStates.map(pptData => {
                        if (pptData.taskUuid === taskUuid) {
                            pptData.progress = 0;
                            pptData.downloadState = DownloadState.downloaded;
                            return pptData;
                        } else {
                            return pptData;
                        }
                    });
                    this.onProgressUpdate(pptDatasStates);
                })
                .catch(error => {
                    console.log("解压失败", error);
                });
        });
        download.onError(error => {
            console.error("下载失败", error);
        });
        download.start();
    };

    private getPptListState = (): PptListState => {
        const downloadData: PptDatasType[] = [];
        for (let pptData of this.pptDatasStates) {
            if (pptData.downloadState === DownloadState.downloaded) {
                downloadData.push(pptData);
            }
        }
        const dataLength = this.pptDatasStates.length;
        const downloadDataLength = downloadData.length;
        if (downloadDataLength === 0) {
            return PptListState.listDownNone;
        } else if (downloadDataLength === dataLength) {
            return PptListState.listDownAll;
        } else {
            return PptListState.listDownPart;
        }
    };

    private detectIsDownload = (ppt: PptDatasType): boolean => {
        return ppt.downloadState === DownloadState.downloaded;
    };

    public downloadAll = async (): Promise<void> => {
        for (let ppt of this.pptDatasStates) {
            if (this.didStop) {
                break;
            }
            if (ppt.taskUuid && !this.detectIsDownload(ppt)) {
                await this.download(ppt.taskUuid);
                this.pptListState = this.getPptListState();
                await this.onPptSuccess();
            }
        }
    };
}
