import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "antd";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface AppButtonProps {
    kind: string;
    name: string;
    addApp: () => Promise<void>;
}

export const AppButton = observer<AppButtonProps>(function AppButton({ kind, name, addApp }) {
    const [loading, setLoading] = useState(false);
    const sp = useSafePromise();

    return (
        <Button
            key={kind}
            loading={loading}
            onClick={async () => {
                setLoading(true);
                await sp(addApp());
                setLoading(false);
            }}
        >
            {name}
        </Button>
    );
});
