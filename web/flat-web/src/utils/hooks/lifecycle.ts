import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { NODE_ENV } from "../../constants/process";

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
 * Leave promise unresolved when the component is unmounted.
 * @example
 * ```ts
 * const sp = useSafePromise()
 * setLoading(true)
 * try {
 *   const result1 = await sp(fetchData1())
 *   const result2 = await sp(fetchData2(result1))
 *   setData(result2)
 * } catch(e) {
 *   setHasError(true)
 * }
 * setLoading(false)
 * ```
 */
export function useSafePromise(): <T, E = unknown>(
    promise: PromiseLike<T>,
    /** When error occurs after the component is unmounted */
    onUnmountedError?: (error: E) => void,
) => Promise<T> {
    const isUnMountRef = useIsUnMounted();

    function safePromise<T, E = unknown>(
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
                    onUnmountedError(error as E);
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

export function useAPI<P, R>(
    api: (payload: P) => Promise<R>,
): {
    first: boolean;
    loading: boolean;
    fetch: (payload: P) => Promise<void>;
    result: R | null;
    error: boolean;
} {
    const isUnMountRef = useIsUnMounted();
    const [first, setFirst] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [result, setResult] = useState<R | null>(null);
    const sp = useSafePromise();

    const fetch = useCallback(
        async (payload: P) => {
            if (isUnMountRef.current) {
                return;
            }
            setFirst(false);
            try {
                setLoading(true);
                const result = await sp(api(payload));
                if (!isUnMountRef.current) {
                    setResult(result);
                }
            } catch {
                if (!isUnMountRef.current) {
                    setError(true);
                }
            } finally {
                if (!isUnMountRef.current) {
                    setLoading(false);
                }
            }
        },
        // it's wrong for eslint to add `P` to deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [api],
    );

    return { first, loading, fetch, result, error };
}
