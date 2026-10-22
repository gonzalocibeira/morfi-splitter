import React, { createContext, useContext, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { monthKeyFromDate } from "../domain/months";
export const UIContext = createContext(null);
function MonthState({ children }) {
    const [selectedMonth, setSelectedMonth] = useState(() => monthKeyFromDate(new Date()));
    const value = useMemo(() => ({ selectedMonth, setSelectedMonth }), [selectedMonth]);
    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
export default function UIProvider({ children }) {
    const { user } = useContext(AuthContext);
    return <MonthState key={user?.uid || "anonymous"}>{children}</MonthState>;
}
