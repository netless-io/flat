import { routeConfig, RouteConfig, RouteNameType } from "../route-config";
import { generatePath, useHistory } from "react-router";
import { useCallback } from "react";

export { RouteNameType } from "../route-config";

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Inspired by {@link https://github.com/ghoullier/awesome-template-literal-types#router-params-parsing}
 * Supports optional params
 */
type ExtractRouteParams<T extends string> = string extends T
    ? Record<string, string>
    : T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param extends `${infer Param}?`
        ? { [k in Param]?: string } & ExtractRouteParams<Rest>
        : { [k in Param]: string } & ExtractRouteParams<Rest>
    : T extends `${infer _Start}:${infer Param}`
    ? Param extends `${infer Param}?`
        ? { [k in Param]?: string }
        : { [k in Param]: string }
    : {};
/* eslint-enable @typescript-eslint/no-unused-vars */

export type RouteParams<T extends RouteNameType> = ExtractRouteParams<RouteConfig[T]["path"]>;

export function generateRoutePath<T extends RouteNameType>(
    name: T,
    params: RouteParams<T>,
): string {
    return generatePath(routeConfig[name].path, params);
}

/**
 * Push history with Flat route
 */
export function usePushHistory(): <T extends RouteNameType>(
    name: T,
    params: RouteParams<T>,
) => void {
    const history = useHistory();

    const pushHistory = useCallback(
        (name: RouteNameType, params: RouteParams<RouteNameType>) => {
            history.push(generateRoutePath(name, params));
        },
        [history],
    );

    return pushHistory;
}
