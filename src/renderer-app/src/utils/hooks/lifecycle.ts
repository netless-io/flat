import { RefObject, useCallback, useEffect, useRef } from "react";
import { NODE_ENV } from "../../constants/Process";

export function useIsUnMounted(): RefObject<boolean> {
    const isUnMountRef = useRef(false);
    useEffect(
        () => () => {
            isUnMountRef.current = true;
        },
        [],
    );
    return isUnMountRef;
}

/**
 * Leave promise unresolved when the component is umounted.
 * @example
 * ```ts
 * const sp = useSafePromise()
 * await sp(asyncTask())
 * ```
 */
export function useSafePromise<T, E>(): (
    promise: PromiseLike<T>,
    /** When error occurs after the component is umounted */
    onUnmountedError?: (error: E) => void,
) => Promise<T> {
    const isUnMountRef = useIsUnMounted();

    function safePromise(
        promise: PromiseLike<T>,
        onUnmountedError?: (error: E) => void,
    ): Promise<T> {
        // the async promise executor is intended
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                const result = await promise;
                if (!isUnMountRef.current) {
                    resolve(result);
                }
                // unresolved promises will be garbage collected.
            } catch (error) {
                if (!isUnMountRef.current) {
                    reject(error);
                } else if (onUnmountedError) {
                    onUnmountedError(error);
                } else {
                    if (NODE_ENV === "development") {
                        console.error(
                            "An error occurs from a promise after a component is unmounted",
                            error,
                        );
                    }
                }
            }
        });
    }

    return useCallback(safePromise, []);
}
