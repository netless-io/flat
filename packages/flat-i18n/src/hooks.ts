import { useCallback, useState } from "react";
import { useValueEnhancer } from "use-value-enhancer";
import { FlatI18n, FlatI18nLanguages, FlatI18nTFunction } from "./flat-i18n";

export function useLanguage(): FlatI18nLanguages {
    const [flatI18n] = useState(FlatI18n.getInstance);
    return useValueEnhancer(flatI18n.$Val.language$);
}

export function useTranslate(): FlatI18nTFunction {
    const [flatI18n] = useState(FlatI18n.getInstance);
    const language = useValueEnhancer(flatI18n.$Val.language$);
    return useCallback<FlatI18nTFunction>(
        (key, options) => flatI18n.t(key, options),
        // update tFunction when language changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [flatI18n, language],
    );
}
