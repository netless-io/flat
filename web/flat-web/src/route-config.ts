export enum RouteNameType {
    LoginPage = "LoginPage",
    HomePage = "HomePage",
}

export const routeConfig = {
    [RouteNameType.LoginPage]: {
        path: "/login",
    },
    [RouteNameType.HomePage]: {
        path: "/",
    },
} as const;

export type ExtraRouteConfig = {};

type CheckRouteConfig<
    T extends {
        [name in RouteNameType]: {
            path: string;
        };
    },
> = T;

export type RouteConfig = CheckRouteConfig<typeof routeConfig>;
