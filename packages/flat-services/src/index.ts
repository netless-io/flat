import type { FlatRTC } from "@netless/flat-rtc";
import type { FlatRTM } from "@netless/flat-rtm";

export interface FlatServicesCatalog {
    rtc: FlatRTC;
    rtm: FlatRTM;
}

export type FlatServiceID = Extract<keyof FlatServicesCatalog, string>;

export type FlatServicesInstance<T extends FlatServiceID> = FlatServicesCatalog[T];

export interface FlatServicesPendingCatalog {
    rtc: Promise<FlatRTC>;
    rtm: Promise<FlatRTM>;
}

export type FlatServicesCreator<T extends FlatServiceID> = () => Promise<FlatServicesCatalog[T]>;

export type FlatServicesCreatorCatalog = {
    [K in FlatServiceID]: FlatServicesCreator<K>;
};

export class FlatServices {
    private registry: Partial<FlatServicesCreatorCatalog> = {};

    private services: Partial<FlatServicesPendingCatalog> = {};

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
    ): Promise<FlatServicesCatalog[T] | undefined> {
        if (this.services[name]) {
            return this.services[name] as Promise<FlatServicesCatalog[T]>;
        }
        const creator = this.registry[name];
        if (creator) {
            return ((this.services[name] as any) = creator());
        }
        return;
    }

    public async shutdownService<T extends FlatServiceID = FlatServiceID>(
        name: T,
    ): Promise<boolean> {
        const pService: FlatServicesPendingCatalog[FlatServiceID] | undefined = this.services[name];
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

export const flatServices: FlatServices =
    (window as any).__FlAtSeRvIcEs || ((window as any).__FlAtSeRvIcEs = new FlatServices());
