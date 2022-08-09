import { IServiceTextChat } from "./services/text-chat";
import { IServiceVideoChat } from "./services/video-chat";
import { IServiceWhiteboard } from "./services/whiteboard";

export interface FlatServicesCatalog {
    videoChat: IServiceVideoChat;
    textChat: IServiceTextChat;
    whiteboard: IServiceWhiteboard;
}

export type FlatServiceID = Extract<keyof FlatServicesCatalog, string>;

export type FlatServicesInstance<T extends FlatServiceID> = FlatServicesCatalog[T];

export type FlatServicesPendingCatalog = {
    [K in FlatServiceID]?: Promise<FlatServicesCatalog[K]>;
};

export type FlatServicesCreator<T extends FlatServiceID> = () => Promise<FlatServicesCatalog[T]>;

export type FlatServicesCreatorCatalog = {
    [K in FlatServiceID]: FlatServicesCreator<K>;
};

declare global {
    interface Window {
        __FlAtSeRvIcEs?: FlatServices;
    }
}

export class FlatServices {
    public static getInstance(): FlatServices {
        return (window.__FlAtSeRvIcEs ||= new FlatServices());
    }

    private registry: Partial<FlatServicesCreatorCatalog> = {};

    private services: Partial<FlatServicesPendingCatalog> = {};

    private constructor() {
        // make private
    }

    public register<T extends FlatServiceID>(
        name: T,
        serviceCreator: FlatServicesCreatorCatalog[T],
    ): void {
        if (this.isRegistered(name)) {
            throw new Error(`${name} is already registered`);
        }
        this.registry[name] = serviceCreator;
    }

    public async unregister<T extends FlatServiceID>(name: T): Promise<boolean> {
        if (this.isRegistered(name)) {
            this.registry[name] = undefined;
            await this.shutdownService(name);
            return true;
        }
        return false;
    }

    public async requestService<T extends FlatServiceID>(
        name: T,
    ): Promise<FlatServicesCatalog[T] | null> {
        if (this.services[name]) {
            return this.services[name] as Promise<FlatServicesCatalog[T]>;
        }
        const creator = this.registry[name];
        if (creator) {
            return ((this.services[name] as any) = creator());
        }
        return null;
    }

    public async shutdownService<T extends FlatServiceID = FlatServiceID>(
        name: T,
    ): Promise<boolean> {
        const pService = this.services[name] as Promise<FlatServicesCatalog[T]> | undefined;
        if (pService) {
            this.services[name] = undefined;
            await (await pService).destroy();
            return true;
        }
        return false;
    }

    public isRegistered(name: FlatServiceID): boolean {
        return Boolean(this.registry[name]);
    }

    public isCreated(name: FlatServiceID): boolean {
        return Boolean(this.services[name]);
    }
}
