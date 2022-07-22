import type { Remitter } from "remitter";
import { FlatCoursewareFile } from "./types";

export type FlatCoursewareMessageData =
    | string
    | { message: string; args: Record<string, string | undefined> };

export type FlatCoursewareLegacyPPTXScene = {
    name?: string;
    ppt?: {
        src: string;
        width: number;
        height: number;
        previewURL?: string;
    };
};

export type FlatCoursewareFileAction =
    | { type: "image"; file: FlatCoursewareFile }
    | { type: "media"; file: FlatCoursewareFile }
    | { type: "docs"; file: FlatCoursewareFile }
    | { type: "pptx"; file: FlatCoursewareFile; urlPrefix: string }
    | { type: "pptx-legacy"; file: FlatCoursewareFile; scenes: FlatCoursewareLegacyPPTXScene[] }
    | { type: "ice"; file: FlatCoursewareFile }
    | { type: "vf"; file: FlatCoursewareFile };

export interface FlatCoursewareEventData {
    insert: FlatCoursewareFileAction;
    preview: FlatCoursewareFileAction;
    /** error code */
    error: FlatCoursewareMessageData;
    /** warning code */
    warning: FlatCoursewareMessageData;
    /** info code */
    info: FlatCoursewareMessageData;
}

export type FlatCoursewareEventNames = Extract<keyof FlatCoursewareEventData, string>;

export type FlatRTCEvents = Remitter<FlatCoursewareEventData>;
