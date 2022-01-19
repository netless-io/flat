import React, { useContext, useEffect, useState } from "react";
import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { loginCheck } from "../../api-middleware/flatServer";
import { PageStoreContext } from "../../components/StoreProvider";
import { RequestErrorCode } from "../../constants/error-code";
import { RouteNameType } from "../../route-config";
import { ServerRequestError } from "../../utils/error/server-request-error";
import { useReplaceHistory } from "../../utils/routes";
import { CloudStorageStore } from "./store";
import "./style.less";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    const { i18n } = useTranslation();
    const replaceHistory = useReplaceHistory();
    const [store] = useState(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => new CloudStorageStore({ compact: false, insertCourseware: () => {}, i18n }),
    );
    useEffect(() => store.initialize(), [store]);

    useEffect(() => {
        loginCheck().catch(error => {
            if (error instanceof ServerRequestError) {
                if (
                    [RequestErrorCode.JWTSignFailed, RequestErrorCode.NeedLoginAgain].includes(
                        error.errorCode,
                    )
                ) {
                    replaceHistory(RouteNameType.LoginPage);
                }
            }
        });
    }, [replaceHistory]);

    const pageStore = useContext(PageStoreContext);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    return <CloudStorageContainer store={store} />;
});

export default CloudStoragePage;
