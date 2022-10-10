import "./style.less";

import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { useSearchParams } from "./hooks";
import { ApplicationsList } from "./ApplicationsList";
import { ApplicationDetail } from "./ApplicationDetail";
import { ApplicationInfo } from "@netless/flat-server-api";

export const ApplicationsPage = observer(function ApplicationsPage() {
    const [query, setQuery] = useSearchParams();
    const navigate = useCallback(
        (a: ApplicationInfo) => {
            setQuery({ q: a.oauthUUID });
        },
        [setQuery],
    );
    const oauthUUID = query.get("q");

    return (
        <UserSettingLayoutContainer>
            {oauthUUID ? (
                <ApplicationDetail oauthUUID={oauthUUID} />
            ) : (
                <ApplicationsList navigate={navigate} />
            )}
        </UserSettingLayoutContainer>
    );
});

export default ApplicationsPage;
