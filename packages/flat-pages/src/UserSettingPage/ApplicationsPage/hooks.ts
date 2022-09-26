import { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";

export function useSearchParams(): [
    URLSearchParams,
    (params: Record<string, string | undefined>) => void,
] {
    const { search } = useLocation();
    const history = useHistory();
    const searchParams = useMemo(() => new URLSearchParams(search), [search]);
    const setSearchParams = useCallback(
        (record: Record<string, string | undefined>) => {
            for (const key of Object.keys(record)) {
                const value = record[key];
                if (value === undefined) {
                    searchParams.delete(key);
                } else {
                    searchParams.set(key, value);
                }
            }
            history.push({ search: searchParams.toString() });
        },
        [history, searchParams],
    );
    return [searchParams, setSearchParams];
}
