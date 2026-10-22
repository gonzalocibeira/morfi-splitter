import { useContext, useEffect } from "react";
import { FireContext } from "../Context/FireContext";
export default function useMonth(monthKey) {
    const { getMonth, loadMonth } = useContext(FireContext);
    useEffect(() => {
        if (!monthKey) return undefined;
        const refresh = () => {
            if (document.visibilityState !== "hidden") loadMonth(monthKey).catch(() => undefined);
        };
        refresh();
        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", refresh);
        return () => {
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", refresh);
        };
    }, [loadMonth, monthKey]);
    return getMonth(monthKey);
}
