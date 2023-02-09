import "./style.less";

import React, { useContext } from "react";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import {
    ErrorPage,
    useSafePromise,
    FilePreviewImage,
    FilePreviewAudio,
    FilePreviewVideo,
    FlatPrefersColorScheme,
    DarkModeContext,
} from "flat-components";
import { RouteNameType, RouteParams } from "../utils/routes";
import { CloudFile } from "@netless/flat-server-api";
import { useIsomorphicLayoutEffect } from "react-use";
import { FlatServices, IServiceFileExtensions, IServiceFilePreview } from "@netless/flat-services";
import { PreferencesStoreContext } from "../components/StoreProvider";
import { useSearchParams } from "../UserSettingPage/ApplicationsPage/hooks";

export interface FilePreviewPageProps {
    file?: CloudFile;
}

export const FilePreviewPage: React.FC<FilePreviewPageProps> = props => {
    const sp = useSafePromise();
    const preferencesStore = useContext(PreferencesStoreContext);
    const isDark = useContext(DarkModeContext);
    const params = useParams<RouteParams<RouteNameType.FilePreviewPage>>();
    const [query] = useSearchParams();
    const [containerNode, setContainerNode] = React.useState<HTMLDivElement | null>(null);
    const [service, setService] = React.useState<IServiceFilePreview | null | undefined>();

    const file = React.useMemo(() => {
        if (props.file) {
            return props.file;
        }
        try {
            return JSON.parse(decodeURIComponent(params.file)) as CloudFile;
        } catch {
            return null;
        }
    }, [props.file, params]);

    const fileExt = React.useMemo(
        () =>
            (/\.([^.]+)$/.exec(file?.fileName || "") || [
                "",
                "",
            ])[1].toLowerCase() as IServiceFileExtensions,
        [file],
    );

    useIsomorphicLayoutEffect(() => {
        const raw = query.get("theme");
        if (!raw) {
            return;
        }
        const theme: FlatPrefersColorScheme =
            raw === "dark" ? "dark" : raw === "light" ? "light" : "auto";
        preferencesStore.updatePrefersColorScheme(theme);
    }, []);

    useIsomorphicLayoutEffect(() => {
        let previewService: IServiceFilePreview | null = null;
        sp(FlatServices.getInstance().requestService(`file-preview:${fileExt}`, false)).then(
            service => {
                previewService = service;
                setService(service);
            },
        );
        return () => {
            previewService?.destroy?.();
        };
    }, []);

    useIsomorphicLayoutEffect(() => {
        if (file && containerNode && service) {
            service.preview(file, containerNode);
        }
    }, [file, containerNode, service]);

    if (!file) {
        return <ErrorPage />;
    }

    return (
        <div
            ref={setContainerNode}
            className={classNames("file-preview-container", {
                "telebox-color-scheme-dark": isDark,
            })}
            style={{ height: "100%", overflow: "hidden" }}
        >
            {service === null && renderBuiltinFilePreview(file, fileExt)}
        </div>
    );
};

export default FilePreviewPage;

function renderBuiltinFilePreview(file: CloudFile, fileExt: string): React.ReactNode {
    switch (fileExt) {
        case "jpg":
        case "jpeg":
        case "png":
        case "webp": {
            return <FilePreviewImage file={file} />;
        }
        case "mp3": {
            return <FilePreviewAudio file={file} />;
        }
        case "mp4": {
            return <FilePreviewVideo file={file} />;
        }
    }
    return <ErrorPage />;
}
