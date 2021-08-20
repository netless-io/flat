import { routeConfig, RouteConfig, RouteNameType, ExtraRouteConfig } from "../route-config";
import { generatePath, useHistory } from "react-router-dom";
import { useCallback } from "react";

export { RouteNameType } from "../route-config";

type PickExtraRouteConfig<
    T extends RouteNameType,
    K extends string,
> = T extends keyof ExtraRouteConfig
    ? K extends keyof ExtraRouteConfig[T]
        ? ExtraRouteConfig[T][K]
        : string
    : string;

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Inspired by {@link https://github.com/ghoullier/awesome-template-literal-types#router-params-parsing}
 * Supports optional params
 */
type ExtractRouteParams<T extends RouteNameType, P extends string> = string extends P
    ? Record<string, string>
    : P extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param extends `${infer Param}?`
        ? { [k in Param]?: PickExtraRouteConfig<T, k> } & ExtractRouteParams<T, Rest>
        : { [k in Param]: PickExtraRouteConfig<T, k> } & ExtractRouteParams<T, Rest>
    : P extends `${infer _Start}:${infer Param}`
    ? Param extends `${infer Param}?`
        ? { [k in Param]?: PickExtraRouteConfig<T, k> }
        : { [k in Param]: PickExtraRouteConfig<T, k> }
    : {};
/* eslint-enable @typescript-eslint/no-unused-vars */

export type RouteParams<T extends RouteNameType> = ExtractRouteParams<T, RouteConfig[T]["path"]>;

export function generateRoutePath<T extends RouteNameType>(
    name: T,
    params?: RouteParams<T>,
): string {
    return generatePath(routeConfig[name].path, params);
}

/**
 * Push history with Flat route
 */
export function usePushHistory(): <T extends RouteNameType>(
    name: T,
    params?: RouteParams<T>,
) => void {
    const history = useHistory();

    const pushHistory = useCallback(
        (name: RouteNameType, params: RouteParams<RouteNameType> = {}) => {
            history.push(generateRoutePath(name, params));
        },
        [history],
    );

    return pushHistory;
}

/**
 * Replace history with Flat route
 */
export function useReplaceHistory(): <T extends RouteNameType>(
    name: T,
    params?: RouteParams<T>,
) => void {
    const history = useHistory();

    const pushHistory = useCallback(
        (name: RouteNameType, params: RouteParams<RouteNameType> = {}) => {
            history.replace(generateRoutePath(name, params));
        },
        [history],
    );

    return pushHistory;
}
