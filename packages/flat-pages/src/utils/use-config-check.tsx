import { useContext, useEffect } from "react";
import { GlobalStoreContext } from "../components/StoreProvider";
import { getServerRegionConfig } from "@netless/flat-server-api";
import { errorTips } from "flat-components";

export function useRegionConfigCheck(): void {
    const globalStore = useContext(GlobalStoreContext);

    useEffect(() => {
        async function checkConfig(): Promise<void> {
            // TODO: or version is not match
            if (!globalStore.serverRegionConfig) {
                try {
                    const serverRegionConfig = await getServerRegionConfig();
                    globalStore.updateServerRegionConfig(serverRegionConfig);
                } catch (e) {
                    globalStore.updateServerRegionConfig(null);
                    console.error(e);
                    errorTips(e as Error);
                }
            }
        }

        void checkConfig();
    }, [globalStore]);

    return;
}
