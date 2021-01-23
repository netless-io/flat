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
} from "mobx";
import { useEffect, DependencyList, useState } from "react";

/**
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
 * @param extraDeps provide extra dependencies to re-setup autorun if non-observable values are used
 */
export function useReaction<T>(
    expression: (reaction: IReactionPublic) => T,
    effect: (value: T, previousValue: T, reaction: IReactionPublic) => void,
    extraDeps: DependencyList = [],
    opts?: IReactionOptions,
): void {
    // MobX takes care of the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => reaction(expression, effect, opts), extraDeps);
}

/**
 * @param extraDeps provide extra dependencies to re-setup autorun if non-observable values are used
 */
export function useWhen(
    predicate: () => boolean,
    effect: () => void,
    extraDeps: DependencyList = [],
    otps?: IWhenOptions,
): void {
    // MobX takes care of the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => when(predicate, effect, otps), extraDeps);
}

export function useComputed<T>(func: () => T, opts?: IComputedValueOptions<T>): T {
    const [computedValue] = useState(() => computed(func, opts));
    return computedValue.get();
}
