import "./style.less";

import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { CloudStorageStore } from "./store";
import { loginCheck } from "../../api-middleware/flatServer";
import { ServerRequestError } from "../../utils/error/server-request-error";
import { RequestErrorCode } from "../../constants/error-code";
import { RouteNameType, useReplaceHistory } from "../../utils/routes";
import { NEED_BINDING_PHONE } from "../../constants/config";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    const replaceHistory = useReplaceHistory();
    const [store] = useState(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => new CloudStorageStore({ compact: false, insertCourseware: () => {} }),
    );

    useEffect(() => {
        loginCheck()
            .then(result => {
                if (NEED_BINDING_PHONE && !result.hasPhone) {
                    replaceHistory(RouteNameType.LoginPage);
                }
            })
            .catch(error => {
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

    return <CloudStorageContainer store={store} />;
});
