import { getServerRegionConfigs } from "@netless/flat-server-api";
import { globalStore } from "@netless/flat-stores";
import { errorTips } from "flat-components";

export const initRegionConfigs = async (): Promise<void> => {
    try {
        const regionConfigs = await getServerRegionConfigs();
        globalStore.updateServerRegionConfig(regionConfigs);
    } catch (error) {
        globalStore.updateServerRegionConfig(null);
        console.error(error);
        errorTips(error as Error);
        throw error; // Break the whole page
    }
};
