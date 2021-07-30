import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";
import { getZipData } from "../../apiMiddleware/courseware-converting";
import { cachePPTConvert, contentType } from "./utils";

type PPTInfo = {
    baseURL: string;
    pptType: "static" | "dynamic";
    taskUUID: string;
};

class CoursewarePreloader {
    public downloaders = new Map<string, Blob>();

    public async preload(pptSrc: string): Promise<void> {
        const pptInfo = CoursewarePreloader.parsePPTURLInfo(pptSrc);
        const { baseURL, pptType, taskUUID } = pptInfo;

        if (this.downloaders.has(taskUUID)) {
            return;
        }

        const zipData = await getZipData(pptInfo);

        this.downloaders.set(taskUUID, zipData);

        const resourceUrlPrefix = `${baseURL}/${pptType}Convert`;

        return CoursewarePreloader.unzip(zipData, resourceUrlPrefix);
    }

    public static parsePPTURLInfo(pptSrc: string): PPTInfo {
        const pptFiles = /^(\S+)\/(static|dynamic)Convert\/([0-9a-f]{32})\//.exec(pptSrc);
        if (!pptFiles) {
            throw new Error(`parse ppt url failed.`);
        }
        const [, baseURL, pptType, taskUUID] = pptFiles;

        return {
            baseURL: baseURL.replace(/^pptx:\/\//, "https://"),
            pptType: pptType as "static" | "dynamic",
            taskUUID,
        };
    }

    private static async unzip(zipData: Blob, resourceUrlPrefix: string): Promise<void> {
        const reader = new ZipReader(new BlobReader(zipData));
        const entries = await reader.getEntries();

        for (const entry of entries) {
            if (!entry.getData) {
                continue;
            }
            const blob: Blob = await entry.getData(new BlobWriter());
            const resourceUrl = `${resourceUrlPrefix}/${entry.filename}`;
            await this.cacheEntry(resourceUrl, blob);
        }
    }

    private static async cacheEntry(resourceUrl: string, blob: Blob): Promise<void> {
        const flatCache = await cachePPTConvert();

        const response = new Response(blob, {
            headers: {
                "Content-Type": contentType(resourceUrl),
            },
        });
        flatCache.put(resourceUrl, response);
    }
}

export const coursewarePreloader = new CoursewarePreloader();
