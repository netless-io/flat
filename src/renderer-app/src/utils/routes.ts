import { routeConfig, RouteConfig, RouteNameType } from "../route-config";
import { generatePath, useHistory } from "react-router";
import { useCallback } from "react";

export { RouteNameType } from "../route-config";

/**
 * @see{@link https://github.com/ghoullier/awesome-template-literal-types#router-params-parsing}
 */
type ExtractRouteParams<T extends string> = string extends T
    ? Record<string, string>
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [k in Param | keyof ExtractRouteParams<Rest>]: string }
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T extends `${infer _Start}:${infer Param}`
    ? { [k in Param]: string }
    : {};

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
