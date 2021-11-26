import { getFileExt } from "../file";

const SupportedFileExts = new Set(
    ".ppt,.pptx,.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif,.mp3,.mp4,.ice,.vf".split(","),
);

export function isSupportedFileExt(file: File): boolean {
    return SupportedFileExts.has("." + getFileExt(file.name));
}
