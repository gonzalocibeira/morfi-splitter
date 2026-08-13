import React, { useContext, useEffect, useMemo, useState } from "react";
import { FireContext } from "../../Context/FireContext";
import MonthPicker from "react-simple-month-picker";
import { calculateSettlement } from "../../domain/expenses";
import { formatCents } from "../../domain/money";
import { formatMonthKey, monthKeyFromDate } from "../../domain/months";

export default function Splitexpense() {
    const { participants, profileStatus, profileError, getMonth, loadMonth } = useContext(FireContext);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const monthState = selectedMonth ? getMonth(selectedMonth) : null;
    const settlement = useMemo(
        () => calculateSettlement(monthState?.expenses || [], participants),
        [monthState?.expenses, participants]
    );

    useEffect(() => {
        if (selectedMonth) {
            loadMonth(selectedMonth).catch(() => undefined);
        }
    }, [loadMonth, selectedMonth]);

    const [first, second] = participants;
    const firstTotal = settlement.totals[first] || { sharedCents: 0, nonSplitCents: 0 };
    const secondTotal = settlement.totals[second] || { sharedCents: 0, nonSplitCents: 0 };
    let debtMessage = "No one owes the other";
    let classSwitch = "no";
    if (settlement.owedCents > 0) {
        debtMessage = `${second} owes ${first} ${formatCents(settlement.owedCents)}`;
        classSwitch = "t";
    } else if (settlement.owedCents < 0) {
        debtMessage = `${first} owes ${second} ${formatCents(Math.abs(settlement.owedCents))}`;
        classSwitch = "n";
    }

    if (profileStatus === "loading") {
        return <p className="statusMsg">Loading household profile…</p>;
    }

    if (profileError || participants.length !== 2) {
        return <p className="errorMsg" role="alert">{profileError || "Two participants are required to split expenses."}</p>;
    }

    return (
        <>
            <div className="splitDate">
                <h2>Select date</h2>
                <MonthPicker onChange={(date) => setSelectedMonth(monthKeyFromDate(date))} />
            </div>
            {!selectedMonth && <p className="statusMsg">Please select a month.</p>}
            {monthState?.status === "loading" && <p className="statusMsg">Loading expenses…</p>}
            {monthState?.status === "error" && (
                <div className="errorMsg" role="alert">
                    <p>{monthState.error}</p>
                    <button onClick={() => loadMonth(selectedMonth, { force: true }).catch(() => undefined)}>Retry</button>
                </div>
            )}
            {selectedMonth && monthState?.status === "success" && (
                <div className="splitCont">
                    <div className="splitTotal">
                        <p>{formatMonthKey(selectedMonth)} total: {formatCents(settlement.totalCents)}</p>
                    </div>
                    <div className="splitNames">
                        <div style={totalsGroupStyle}>
                            <h4>Shared expenses</h4>
                            <div style={totalsRowStyle}>
                                <p>{first} spent: {formatCents(firstTotal.sharedCents)}</p>
                                <p>{second} spent: {formatCents(secondTotal.sharedCents)}</p>
                            </div>
                        </div>
                        <div style={{ ...totalsGroupStyle, marginTop: 15 }}>
                            <h4>Purchases made on behalf of the other</h4>
                            <div style={totalsRowStyle}>
                                <p>{first} spent: {formatCents(firstTotal.nonSplitCents)}</p>
                                <p>{second} spent: {formatCents(secondTotal.nonSplitCents)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="splitFlow">
                        <span className={classSwitch === "t" ? "activeArrow" : "inactiveArrow"}>←</span>
                        <span className={classSwitch === "no" ? "activeArrow" : "inactiveArrow"}>-</span>
                        <span className={classSwitch === "n" ? "activeArrow" : "inactiveArrow"}>→</span>
                        <p>{debtMessage}</p>
                    </div>
                    {monthState.expenses.length === 0 && <p className="statusMsg">There are no expenses in this month.</p>}
                    {monthState.invalidCount > 0 && <p className="errorMsg">{monthState.invalidCount} malformed expense record(s) were skipped.</p>}
                </div>
            )}
        </>
    );
}

const totalsGroupStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "90%"
};

const totalsRowStyle = {
    display: "flex",
    justifyContent: "space-around",
    width: "100%"
};
