import React, { lazy, Suspense, useContext, useEffect, useMemo, useState } from "react";
import Detailedview from "./Detailedview";
import { FireContext } from "../../Context/FireContext";
import MonthPicker from "react-simple-month-picker";
import AOS from "aos";
import "aos/dist/aos.css";
import { buildChartData } from "../../domain/expenses";
import { formatMonthKey, monthKeyFromDate } from "../../domain/months";

const DailyChart = lazy(() => import("./charts/DailyChart"));
const CategoryChart = lazy(() => import("./charts/CategoryChart"));
const UserChart = lazy(() => import("./charts/UserChart"));

export default function Detailedviewcontainer() {
    const { participants, getMonth, loadMonth } = useContext(FireContext);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [chartType, setChartType] = useState("daily");
    const monthState = selectedMonth ? getMonth(selectedMonth) : null;
    const chartData = useMemo(
        () => buildChartData(monthState?.expenses || []),
        [monthState?.expenses]
    );

    useEffect(() => {
        AOS.init();
    }, []);

    useEffect(() => {
        if (selectedMonth) {
            loadMonth(selectedMonth).catch(() => undefined);
        }
    }, [loadMonth, selectedMonth]);

    let chart = <DailyChart data={chartData.daily} />;
    if (chartType === "category") {
        chart = <CategoryChart data={chartData.categories} />;
    } else if (chartType === "user") {
        chart = <UserChart data={chartData.participants} />;
    }

    return (
        <>
            <div className="splitDate">
                <h2>Select date</h2>
                <MonthPicker onChange={(date) => setSelectedMonth(monthKeyFromDate(date))} />
            </div>
            {!selectedMonth && <h2 className="statusMsg">Please select a month.</h2>}
            {monthState?.status === "loading" && <p className="statusMsg">Loading expenses…</p>}
            {monthState?.status === "error" && (
                <div className="errorMsg" role="alert">
                    <p>{monthState.error}</p>
                    <button onClick={() => loadMonth(selectedMonth, { force: true }).catch(() => undefined)}>Retry</button>
                </div>
            )}
            {selectedMonth && monthState?.status === "success" && (
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <h2 style={{ textAlign: "center" }}>↓ Expenses for {formatMonthKey(selectedMonth)} ↓</h2>
                    {monthState.invalidCount > 0 && (
                        <p className="errorMsg" role="alert">{monthState.invalidCount} malformed expense record(s) were skipped.</p>
                    )}
                    {monthState.expenses.length === 0 ? (
                        <p className="statusMsg">There are no expenses in this month.</p>
                    ) : (
                        <>
                            <h3 style={{ borderBottom: "solid 2px black", textAlign: "center" }}>Charts</h3>
                            <div style={{ display: "flex", justifyContent: "space-evenly", marginBottom: 30 }}>
                                <button className="chartBtn" onClick={() => setChartType("daily")}>Day to day</button>
                                <button className="chartBtn" onClick={() => setChartType("category")}>By category</button>
                                <button className="chartBtn" onClick={() => setChartType("user")}>By user</button>
                            </div>
                            <Suspense fallback={<p className="statusMsg">Loading chart…</p>}>
                                {chart}
                            </Suspense>
                            <h3 style={{ borderBottom: "solid 2px black", textAlign: "center", marginTop: "40px" }}>
                                List of expenses by date
                            </h3>
                            <div style={{ marginTop: 10, marginBottom: 20, overflow: "hidden" }}>
                                {monthState.expenses.map((expense) => (
                                    <Detailedview
                                        key={expense.id}
                                        expense={expense}
                                        monthKey={selectedMonth}
                                        participants={participants}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
