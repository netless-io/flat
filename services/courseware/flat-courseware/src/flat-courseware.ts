import { CloudFile } from "@netless/flat-server-api";
import { Remitter } from "remitter";
import type { FlatCoursewareEventData } from "./events";

export abstract class FlatCourseware {
    public readonly events = new Remitter<FlatCoursewareEventData>();

    public abstract insert(file: CloudFile): Promise<void>;

    public abstract preview(file: CloudFile): Promise<void>;

    public async destroy(): Promise<void> {
        this.events.destroy();
    }
}
