import {
    computed,
    IComputedValue,
    IComputedValueOptions,
    IReactionOptions,
    IReactionPublic,
    observable,
    reaction,
} from "mobx";
import { useLocalObservable } from "mobx-react-lite";
import { DependencyList, RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

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
                    if (process.env.NODE_ENV === "development") {
                        console.error(
                            "An error occurs from a promise after a component is unmounted",
                            error,
                        );
                    }
                }
            }
        });
    }

    return useCallback(safePromise, [isUnMountRef]);
}

/**
 * Reruns a side effect when any selected data changes.
 * @see {@link https://mobx.js.org/reactions.html#reaction}
 *
 * @param expression observes changes and return a value that is used as input for the effect function.
 * @param effect execute side-effects.
 * @param extraDeps provide extra dependencies for detection if non-observable values are used
 */
export function useReaction<T>(
    expression: (reaction: IReactionPublic) => T,
    effect: (value: T, previousValue: T, reaction: IReactionPublic) => void,
    extraDeps: DependencyList = [],
    opts?: IReactionOptions<{ result: T; deps: DependencyList }, false>,
): void {
    // always keeps the latest callback
    // so that no stale values
    const effectRef = useRef(effect);

    const deps = useLocalObservable(() => observable.array(extraDeps as any[]));

    // Update the effect callback
    // synchronously after every rendering being committed
    useIsomorphicLayoutEffect(() => {
        effectRef.current = effect;
    });

    useEffect(() => {
        deps.replace(extraDeps as any[]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, extraDeps);

    useEffect(
        () =>
            reaction(
                reaction => ({
                    result: expression(reaction),
                    // track all the dependencies
                    deps: deps.slice(),
                }),
                (arg, prev, reaction) => effectRef.current(arg.result, prev.result, reaction),
                opts,
            ),
        // MobX takes care of the deps.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
}

/**
 * Computed values can be used to derive information from other observables.
 * @see {@link https://mobx.js.org/computeds.html}
 *
 * @param func derive information from other observables
 * @param extraDeps provide extra dependencies to re-compute if non-observable values are used
 */
export function useComputed<T>(
    func: () => T,
    extraDeps: DependencyList = [],
    opts?: IComputedValueOptions<T>,
): IComputedValue<T> {
    // MobX takes care of the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => computed(func, opts), extraDeps);
}
