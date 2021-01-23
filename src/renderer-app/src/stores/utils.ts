/**
 * Merge contructor config to Store
 */
export function mergeConfig<S extends {}, K extends keyof S>(
    store: S,
    config?: { [k in K]: S[k] } | null,
): void {
    if (!config) {
        return;
    }

    const setStoreProp = (key: K): void => {
        if (config[key] !== void 0 && Object.prototype.hasOwnProperty.call(store, key)) {
            store[key] = config[key]!;
        }
    };

    Object.keys(config).forEach(setStoreProp as (key: string) => void);
}
