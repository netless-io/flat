import { useCallback, useEffect, useState } from "react";

import { listBindings, ListBindingsResult } from "@netless/flat-server-api";
import { useSafePromise } from "../../../utils/hooks/lifecycle";

export function useBindingList(): { bindings: ListBindingsResult; refresh: () => void } {
    const sp = useSafePromise();
    const [bindings, setBindings] = useState<ListBindingsResult>({} as ListBindingsResult);

    const refresh = useCallback(() => {
        sp(listBindings()).then(setBindings);
    }, [sp]);

    useEffect(refresh, [refresh]);

    return { bindings, refresh };
}
