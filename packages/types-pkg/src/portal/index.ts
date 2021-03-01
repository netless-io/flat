import { WindowsName } from "../constants";

export interface Options {
    title: string;
    name: WindowsName;
    width: number;
    height: number;
    disableClose?: boolean;
}
