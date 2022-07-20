import { useEffect, useState } from "react";

export function useWindowFocus(): boolean {
    const [focus, setFocus] = useState(true);

    useEffect(() => {
        const on = (): void => setFocus(true);
        const off = (): void => setFocus(false);

        window.addEventListener("focus", on);
        window.addEventListener("blur", off);

        return () => {
            window.removeEventListener("focus", on);
            window.removeEventListener("blur", off);
        };
    }, []);

    return focus;
}
