import { useCallback, useEffect, useState } from "react";

import { listBindings, ListBindingsResult } from "../../../../api-middleware/flatServer";
import { useSafePromise } from "../../../../utils/hooks/lifecycle";

const defaultBindings: ListBindingsResult = {
    wechat: false,
    phone: false,
    agora: false,
    apple: false,
    github: false,
    google: false,
};

export function useBindingList(): { bindings: ListBindingsResult; refresh: () => void } {
    const sp = useSafePromise();
    const [bindings, setBindings] = useState<ListBindingsResult>(defaultBindings);

    const refresh = useCallback(() => {
        sp(listBindings()).then(setBindings);
    }, [sp]);

    useEffect(refresh, [refresh]);

    return { bindings, refresh };
}
