import {
    autorun,
    IAutorunOptions,
    IReactionOptions,
    IReactionPublic,
    IWhenOptions,
    reaction,
    when,
    computed,
    IComputedValueOptions,
    IComputedValue,
    observable,
} from "mobx";
import { useLocalObservable } from "mobx-react-lite";
import { useEffect, DependencyList, useMemo, useRef } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

/**
 * Reruns a function every time anything it observes changes.
 * @see {@link https://mobx.js.org/reactions.html#autorun}
 *
 * @param view observes changes and trigger reaction
 * @param extraDeps provide extra dependencies to re-setup autorun if non-observable values are used
 */
export function useAutoRun(
    view: (reaction: IReactionPublic) => void,
    extraDeps: DependencyList = [],
    opts?: IAutorunOptions,
): void {
    // MobX takes care of the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => autorun(view, opts), extraDeps);
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
 * Executes a side effect once when a observable condition becomes true.
 * @see {@link https://mobx.js.org/reactions.html#when}
 *
 * @param predicate observes changes until it returns `true`.
 * @param effect will run only once when `predicate` returns `true`.
 * @param extraDeps provide extra dependencies for detection if non-observable values are used
 */
export function useWhen(
    predicate: () => boolean,
    effect: () => void,
    extraDeps: DependencyList = [],
    opts?: IWhenOptions,
): void {
    // always keeps the latest callback
    // so that no stale values
    const effectRef = useRef(effect);

    // Update the effect callback
    // synchronously after every rendering being committed
    useIsomorphicLayoutEffect(() => {
        effectRef.current = effect;
    });

    // MobX takes care of the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => when(predicate, () => effectRef.current(), opts), extraDeps);
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
