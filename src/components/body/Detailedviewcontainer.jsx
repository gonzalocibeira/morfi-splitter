import React, { lazy, Suspense, useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Detailedview from "./Detailedview";
import { FireContext } from "../../Context/FireContext";
import { UIContext } from "../../Context/UIContext";
import MonthPicker from "./MonthPicker";
import { buildChartData } from "../../domain/expenses";
import { formatMonthKey } from "../../domain/months";
import useMonth from "../../hooks/useMonth";
import { Button, Card, Loading, MonthStatus, PageTitle, ProfileGate } from "../ui/Primitives";
import Icon from "../ui/Icon";
const DailyChart = lazy(() => import("./charts/DailyChart"));
const CategoryChart = lazy(() => import("./charts/CategoryChart"));
const UserChart = lazy(() => import("./charts/UserChart"));
function History({ expenses, monthKey }) {
    const { pendingOperations, deleteExpense, updateExpenseAmount } = useContext(FireContext);
    const [visible, setVisible] = useState(50);
    return (
        <Card className="history-card">
            <div className="section-topline">
                <div>
                    <h2>Expense history</h2>
                </div>
                <span className="count-badge">{expenses.length}</span>
            </div>
            <div className="expense-list">
                {expenses.slice(0, visible).map((expense) => (
                    <Detailedview
                        key={expense.id}
                        expense={expense}
                        monthKey={monthKey}
                        pending={Boolean(pendingOperations[expense.id])}
                        deleteExpense={deleteExpense}
                        updateExpenseAmount={updateExpenseAmount}
                    />
                ))}
            </div>
            {visible < expenses.length && (
                <div className="load-more">
                    <p>
                        Showing {Math.min(visible, expenses.length)} of {expenses.length} expenses
                    </p>
                    <Button variant="secondary" onClick={() => setVisible((count) => count + 50)}>
                        Show {Math.min(50, expenses.length - visible)} more
                    </Button>
                </div>
            )}
        </Card>
    );
}
export default function Detailedviewcontainer() {
    const { selectedMonth, setSelectedMonth } = useContext(UIContext);
    const [chartType, setChartType] = useState("daily");
    const month = useMonth(selectedMonth);
    const chartData = useMemo(() => buildChartData(month.expenses), [month.expenses]);
    const chart =
        chartType === "category" ? (
            <CategoryChart data={chartData.categories} />
        ) : chartType === "user" ? (
            <UserChart data={chartData.participants} />
        ) : (
            <DailyChart data={chartData.daily} />
        );
    return (
        <>
            <PageTitle title="Expense details" icon="chart" />
            <ProfileGate>
                <div className="month-toolbar">
                    <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
                </div>
                <MonthStatus month={month} monthKey={selectedMonth} />
                {selectedMonth &&
                    month.status === "success" &&
                    (month.expenses.length === 0 ? (
                        <Card className="empty-state">
                            <Icon name="chart" size={36} />
                            <h2>No expenses</h2>
                            <p>There are no expenses in {formatMonthKey(selectedMonth)}.</p>
                            <Link to="/new" className="text-link">
                                Add an expense <Icon name="arrow" size={16} />
                            </Link>
                        </Card>
                    ) : (
                        <>
                            <Card className="chart-card">
                                <div className="section-topline">
                                    <div>
                                        <p className="eyebrow">{formatMonthKey(selectedMonth)}</p>
                                        <h2>Spending charts</h2>
                                    </div>
                                </div>
                                <div className="chart-switch" role="group" aria-label="Chart view">
                                    {[
                                        ["daily", "Day to day"],
                                        ["category", "By category"],
                                        ["user", "By user"],
                                    ].map(([type, label]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            aria-pressed={chartType === type}
                                            className={chartType === type ? "is-active" : ""}
                                            onClick={() => setChartType(type)}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <div
                                    className="chart-region"
                                    role="region"
                                    aria-label={`${chartType === "daily" ? "Daily" : chartType === "category" ? "Category" : "Participant"} expense chart`}
                                >
                                    <Suspense fallback={<Loading>Loading chart…</Loading>}>
                                        {chart}
                                    </Suspense>
                                </div>
                            </Card>
                            <History
                                key={selectedMonth}
                                expenses={month.expenses}
                                monthKey={selectedMonth}
                            />
                        </>
                    ))}
            </ProfileGate>
        </>
    );
}
