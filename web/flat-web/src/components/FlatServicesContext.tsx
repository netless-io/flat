import React from "react";
import { createContext } from "react";
import {
    FlatServices,
    flatServices,
    FlatServiceID,
    FlatServicesInstance,
    FlatServicesCatalog,
} from "@netless/flat-services";
import { useIsomorphicLayoutEffect } from "react-use";
import { useSafePromise } from "flat-components";

export const FlatServicesContext = createContext<FlatServices>(flatServices);

export const FlatServicesContextProvider: React.FC = props => (
    <FlatServicesContext.Provider value={flatServices}>
        {props.children}
    </FlatServicesContext.Provider>
);

export const useFlatService = <T extends FlatServiceID>(
    name: T,
): FlatServicesInstance<T> | undefined => {
    const flatServices = React.useContext(FlatServicesContext);
    const [service, setService] = React.useState<FlatServicesInstance<T>>();
    const sp = useSafePromise();
    useIsomorphicLayoutEffect(() => {
        sp(flatServices.requestService(name)).then(setService);
    }, [flatServices, name]);
    return service;
};

export type WithFlatServicesProps<P = {}, S extends FlatServiceID = FlatServiceID> = P &
    Pick<FlatServicesCatalog, S>;

export const withFlatServices = <S extends FlatServiceID>(...names: S[]) => {
    return <P extends {}>(Component: React.ComponentType<WithFlatServicesProps<P, S>>) => {
        const WithFlatServices: React.FC<P> = props => {
            const flatServices = React.useContext(FlatServicesContext);
            const [services, setServices] = React.useState<Pick<FlatServicesCatalog, S>>();
            const sp = useSafePromise();
            useIsomorphicLayoutEffect(() => {
                sp(Promise.all(names.map(name => flatServices.requestService(name)))).then(
                    serviceList => {
                        setServices(
                            serviceList.reduce((acc, service, i) => {
                                acc[names[i]] = service;
                                return acc;
                            }, {} as any),
                        );
                    },
                );
            }, [flatServices]);
            return services ? <Component {...services} {...props} /> : null;
        };
        return WithFlatServices;
    };
};
