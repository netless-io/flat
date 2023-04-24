import type { CompareFn } from "antd/lib/table/interface";

export function createFileNameComparer(): CompareFn<{ fileName: string }> {
    // based on https://github.com/microsoft/vscode/blob/main/src/vs/base/common/comparers.ts
    if (typeof Intl !== "undefined" && Intl["Collator"]) {
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
        const numeric = collator.resolvedOptions().numeric;
        return (a, b) => {
            const result = collator.compare(a.fileName, b.fileName);
            if (numeric && result === 0 && a.fileName !== b.fileName) {
                return a.fileName.localeCompare(b.fileName);
            }
            return result;
        };
    }

    return (a, b) => a.fileName.localeCompare(b.fileName);
}
