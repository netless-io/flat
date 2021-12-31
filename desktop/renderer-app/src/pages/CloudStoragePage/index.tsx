import "./style.less";

import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { CloudStorageStore } from "./store";
import { loginCheck } from "../../api-middleware/flatServer";
import { ServerRequestError } from "../../utils/error/server-request-error";
import { RequestErrorCode } from "../../constants/error-code";
import { RouteNameType, useReplaceHistory } from "../../utils/routes";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    const { i18n } = useTranslation();
    const replaceHistory = useReplaceHistory();
    const [store] = useState(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => new CloudStorageStore({ compact: false, insertCourseware: () => {}, i18n }),
    );

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

    useEffect(() => store.initialize(), [store]);

    return (
        <MainPageLayoutContainer>
            <CloudStorageContainer store={store} />
        </MainPageLayoutContainer>
    );
});
