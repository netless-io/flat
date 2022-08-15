import { IServiceFile, IServiceFileCatalog } from "./services/file";
import { IServiceTextChat } from "./services/text-chat";
import { IService } from "./services/typing";
import { IServiceVideoChat } from "./services/video-chat";
import { IServiceWhiteboard } from "./services/whiteboard";

export type FlatServicesCatalog = IServiceFileCatalog & {
    file: IServiceFile;
    videoChat: IServiceVideoChat;
    textChat: IServiceTextChat;
    whiteboard: IServiceWhiteboard;
};

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

    private registry = new Map<FlatServiceID, () => Promise<IService>>();

    private services = new Map<FlatServiceID, Promise<IService>>();

    private constructor() {
        // make private
    }

    public register<T extends FlatServiceID>(
        name: T | T[],
        serviceCreator: FlatServicesCreatorCatalog[T],
    ): void {
        const names = Array.isArray(name) ? name : [name];
        names.forEach(name => {
            if (this.isRegistered(name)) {
                throw new Error(`${name} is already registered`);
            }
            this.registry.set(name, serviceCreator);
        });
    }

    public async unregister<T extends FlatServiceID>(name: T): Promise<boolean> {
        if (this.isRegistered(name)) {
            this.registry.delete(name);
            await this.shutdownService(name);
            return true;
        }
        return false;
    }

    public async requestService<T extends FlatServiceID>(
        name: T,
    ): Promise<FlatServicesCatalog[T] | null> {
        let service = this.services.get(name) || null;
        if (!service) {
            const creator = this.registry.get(name);
            if (creator) {
                service = creator();
                this.services.set(name, service);
            }
        }
        return service as Promise<FlatServicesCatalog[T]> | null;
    }

    public async shutdownService<T extends FlatServiceID = FlatServiceID>(
        name: T,
    ): Promise<boolean> {
        const pService = this.services.get(name);
        if (pService) {
            this.services.delete(name);
            const service = await pService;
            await service.destroy?.();
            return true;
        }
        return false;
    }

    public isRegistered(name: FlatServiceID): boolean {
        return this.registry.has(name);
    }

    public isCreated(name: FlatServiceID): boolean {
        return this.services.has(name);
    }
}
