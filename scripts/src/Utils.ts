import editJsonFile from "edit-json-file";
import path from "path";

export function log(content: any) {
    if ({}.toString.call(content) === "[object Object]") {
        console.log(JSON.stringify(content, null, 2));
    } else {
        console.log(content);
    }
}

export const arch = process.platform === "win32" ? "ia32" : "x64";

export const platform = process.platform === "win32" ? "win32" : "darwin";

export const packageJsonFile: any = editJsonFile(path.resolve(__dirname, "..", "package.json"), {
    stringify_width: 4,
});

export function setAgoraBuildInfo(args: object) {
    Object.keys(args).forEach(k => {
        packageJsonFile.set(`agora_electron.${k}`, args[k]);
    });
    packageJsonFile.save();
}
