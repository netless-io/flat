import { IpcMainEvent } from "electron";
import { Subject } from "rxjs";

export class RxSubject {
    public constructor(
        public readonly mainWindowCreated = new Subject(),
        public readonly domReady = new Subject<string>(),
        public readonly preloadLoad = new Subject<IpcMainEvent>(),
    ) {}
}
