import { useTranslate } from "@netless/flat-i18n";
import {
    applicationDetail,
    ApplicationDetail as Data,
    DeveloperOAuthScope,
} from "@netless/flat-server-api";
import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface ApplicationDetailProps {
    oauthUUID: string;
}

export const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ oauthUUID }) => {
    const t = useTranslate();
    const sp = useSafePromise();
    const [data, setData] = useState<Data | null>(null);
    const [error, setError] = useState(false);
    const history = useHistory();

    useEffect(() => {
        setError(false);
        // sp(applicationDetail(oauthUUID))
        //     .then(setData)
        //     .catch(() => {
        //         setError(true);
        //     });

        // fake data
        sp(new Promise(r => setTimeout(r, 1000))).then(() => {
            setData({
                appDesc: "desc",
                appName: "name",
                homepageURL: "https://example.org",
                logoURL: "http://placekitten.com/64/64",
                ownerName: "owner",
                scopes: [
                    DeveloperOAuthScope.UserAvatarRead,
                    DeveloperOAuthScope.UserNameRead,
                    DeveloperOAuthScope.UserUUIDRead,
                ],
            });
        });
    }, [oauthUUID, sp]);

    if (error) {
        return (
            <div className="application-detail-error">
                Failed to fetch application detail of &quot;{oauthUUID}&quot;
            </div>
        );
    }

    if (data === null) {
        return <div className="application-detail-loading">Loading...</div>;
    }

    const { logoURL, appName, ownerName, homepageURL, appDesc, scopes } = data;

    return (
        <section className="application-detail">
            <header className="application-detail-brand">
                <div className="application-detail-brand-logo">
                    <img alt="logo" src={logoURL} />
                </div>
                <div className="application-detail-brand-info">
                    <div className="application-detail-name">{appName}</div>
                    <div className="application-detail-owner-url">
                        <span className="application-detail-owner">{ownerName}</span>
                        <span className="application-detail-url">
                            <a href={homepageURL}>{homepageURL}</a>
                        </span>
                    </div>
                </div>
                <div className="application-detail-brand-action">
                    <Button danger>取消授权</Button>
                </div>
            </header>
            <p className="application-detail-desc">{appDesc}</p>
            <div className="application-detail-scopes">
                <h4>Permissions</h4>
                <ul>
                    {scopes.map(scope => (
                        <li key={scope} data-scope={scope}>
                            {scope}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};
