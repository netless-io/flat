import React, { useEffect, useState } from "react";
import { applicationDetail, ApplicationDetail as Data } from "@netless/flat-server-api";
import { useTranslate } from "@netless/flat-i18n";
import { Button } from "antd";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface ApplicationDetailProps {
    oauthUUID: string;
}

export const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ oauthUUID }) => {
    const t = useTranslate();
    const sp = useSafePromise();
    const [data, setData] = useState<Data | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
        sp(applicationDetail(oauthUUID))
            .then(setData)
            .catch(() => {
                setError(true);
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
        return <div className="application-detail-loading">{t("loading")}&hellip;</div>;
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
                    <Button danger>{t("apps-revoke")}</Button>
                </div>
            </header>
            <p className="application-detail-desc">{appDesc}</p>
            <div className="application-detail-scopes">
                <h4>{t("apps-permissions")}</h4>
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
