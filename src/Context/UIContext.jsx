import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { monthKeyFromDate } from "../domain/months";
export const UIContext = createContext(null);
const LEGACY_UI_KEY = "morfi-splitter:legacy-ui";
function MonthState({ children }) {
    const [selectedMonth, setSelectedMonth] = useState(() => monthKeyFromDate(new Date()));
    const [legacyUI, setLegacyUI] = useState(() => {
        try {
            return localStorage.getItem(LEGACY_UI_KEY) === "true";
        } catch {
            return false;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(LEGACY_UI_KEY, String(legacyUI));
        } catch {
            // The preference still works for this session when browser storage is unavailable.
        }
    }, [legacyUI]);
    const value = useMemo(
        () => ({ selectedMonth, setSelectedMonth, legacyUI, setLegacyUI }),
        [selectedMonth, legacyUI],
    );
    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
export default function UIProvider({ children }) {
    const { user } = useContext(AuthContext);
    return <MonthState key={user?.uid || "anonymous"}>{children}</MonthState>;
}
