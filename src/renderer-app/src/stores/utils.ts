import { makeAutoObservable, reaction, toJS } from "mobx";

export function autoPersistStore<TStore>(storeLSName: string, store: TStore): void {
    const config = getLSStore<TStore>(storeLSName);
    if (config) {
        const keys = (Object.keys(config) as unknown) as Array<keyof TStore>;
        for (const key of keys) {
            if (typeof store[key] !== "function") {
                store[key] = config[key];
            }
        }
    }

    makeAutoObservable(store);

    reaction(
        () => toJS(store),
        store => setLSStore(storeLSName, store),
    );
}

function getLSStore<TStore>(storeLSName: string): null | TStore {
    try {
        const str = localStorage.getItem(storeLSName);
        return str ? JSON.parse(str) : null;
    } catch (e) {
        return null;
    }
}

function setLSStore<TStore>(storeLSName: string, configStore: TStore): void {
    localStorage.setItem(storeLSName, JSON.stringify(configStore));
}
