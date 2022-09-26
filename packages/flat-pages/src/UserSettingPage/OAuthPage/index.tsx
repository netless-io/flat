import "./style.less";

import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { useSearchParams } from "../ApplicationsPage/hooks";
import { OAuthList } from "./OAuthList";
import { NewOAuth } from "./NewOAuth";
import { EditOAuth } from "./EditOAuth";

export interface OAuthPageCommonProps {
    navigate: (page: "new" | "edit" | "index", oauthUUID?: string) => void;
}

export const OAuthPage = observer(function OAuthPage() {
    const [query, setQuery] = useSearchParams();
    const navigate = useCallback(
        (page: "new" | "edit" | "index", oauthUUID) => {
            setQuery({ p: page === "index" ? undefined : page, q: oauthUUID });
        },
        [setQuery],
    );
    const page = query.get("p") as "new" | "edit" | null;
    const oauthUUID = query.get("q");

    return (
        <UserSettingLayoutContainer>
            <div className="oauth-page">
                {page === "new" ? (
                    <NewOAuth navigate={navigate} />
                ) : page === "edit" && oauthUUID ? (
                    <EditOAuth navigate={navigate} oauthUUID={oauthUUID} />
                ) : (
                    <OAuthList navigate={navigate} />
                )}
            </div>
        </UserSettingLayoutContainer>
    );
});

export default OAuthPage;
