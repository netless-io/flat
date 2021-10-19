import { Subject } from "rxjs";
import { IpcMainEvent } from "electron";

export class RxSubject {
    public constructor(
        public readonly mainWindowCreated = new Subject(),
        public readonly domReady = new Subject<string>(),
        public readonly preloadLoad = new Subject<IpcMainEvent>(),
    ) {}
}
