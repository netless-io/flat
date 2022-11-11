import "./ExtraPadding.less";

import React, { useContext } from "react";
import { RuntimeContext } from "./StoreProvider";

export const ExtraPadding: React.FC = React.memo(function ExtraPadding() {
    const runtime = useContext(RuntimeContext);
    return runtime?.isMac ? <div className="extra-padding" /> : null;
});
