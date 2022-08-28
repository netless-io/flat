import { autorun, makeAutoObservable, toJS } from "mobx";

type LSPersistStore<TStore> = [number, TStore];

export function autoPersistStore<TStore extends object>({
    storeLSName,
    store,
    version = 1,
}: {
    storeLSName: string;
    store: TStore;
    version?: number;
}): void {
    const config = getLSStore<TStore>(storeLSName, version);
    if (config) {
        const keys = Object.keys(config) as unknown as Array<keyof TStore>;
        for (const key of keys) {
            if (typeof store[key] !== "function") {
                store[key] = config[key];
            }
        }
    }

    makeAutoObservable(store);

    autorun(() => setLSStore(storeLSName, toJS(store), version));
}

function getLSStore<TStore>(storeLSName: string, lsVersion: number): null | TStore {
    try {
        const str = localStorage.getItem(storeLSName);
        if (!str) {
            return null;
        }

        const [version, store]: LSPersistStore<TStore> = JSON.parse(str);

        if (version !== lsVersion) {
            // clear storage if not match
            setLSStore(storeLSName, null, lsVersion);
            return null;
        }

        return store;
    } catch (e) {
        return null;
    }
}

function setLSStore<TStore>(storeLSName: string, Store: TStore, lsVersion: number): void {
    localStorage.setItem(storeLSName, JSON.stringify([lsVersion, Store]));
}
