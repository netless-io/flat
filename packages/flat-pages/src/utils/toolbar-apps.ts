import monacoSVG from "../assets/image/tool-monaco.svg";
import geogebraSVG from "../assets/image/tool-geogebra.svg";
import countdownSVG from "../assets/image/tool-countdown.svg";
import saveSVG from "../assets/image/tool-save.svg";
import presetsSVG from "../assets/image/tool-presets.svg";

import { apps, FastboardApp } from "@netless/fastboard-react";
import { noop } from "lodash-es";
import { FlatI18n, FlatI18nTFunction } from "@netless/flat-i18n";

export interface RefreshAppsParams {
    t: FlatI18nTFunction;
    onSaveAnnotation?: (app: FastboardApp) => void;
    onPresets?: (app: FastboardApp) => void;
}

export const refreshApps = ({ t, onSaveAnnotation, onPresets }: RefreshAppsParams): void => {
    apps.clear();
    apps.push(
        {
            kind: "Monaco",
            icon: monacoSVG,
            label: t("tool.monaco"),
            onClick: app => app.insertCodeEditor(),
        },
        {
            kind: "GeoGebra",
            icon: geogebraSVG,
            label: t("tool.geogebra"),
            onClick: app => app.insertGeoGebra(),
        },
        {
            kind: "Countdown",
            icon: countdownSVG,
            label: t("tool.countdown"),
            onClick: app => app.insertCountdown(),
        },
        {
            kind: "Save",
            icon: saveSVG,
            label: t("tool.save"),
            onClick: onSaveAnnotation || noop,
        },
        {
            kind: "Presets",
            icon: presetsSVG,
            label: t("tool.presets"),
            onClick: onPresets || noop,
        },
    );
};

refreshApps({ t: FlatI18n.t });
