import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { FireContext } from "../../Context/FireContext";
import { UIContext } from "../../Context/UIContext";
import MonthPicker from "./MonthPicker";
import { calculateSettlement } from "../../domain/expenses";
import { formatCents } from "../../domain/money";
import { formatMonthKey } from "../../domain/months";
import useMonth from "../../hooks/useMonth";
import { Card, MonthStatus, PageTitle, ProfileGate } from "../ui/Primitives";
import Icon from "../ui/Icon";
export default function Splitexpense() {
    const { participants } = useContext(FireContext);
    const { selectedMonth, setSelectedMonth, legacyUI } = useContext(UIContext);
    const month = useMonth(selectedMonth);
    const settlement = useMemo(
        () => calculateSettlement(month.expenses, participants),
        [month.expenses, participants],
    );
    const [first, second] = participants;
    const debtor = settlement.owedCents > 0 ? second : first;
    const creditor = settlement.owedCents > 0 ? first : second;
    return (
        <>
            <PageTitle title="Split expenses" icon="split" />
            <ProfileGate>
                <div className="month-toolbar">
                    <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
                </div>
                <MonthStatus month={month} monthKey={selectedMonth} />
                {selectedMonth && month.status === "success" && (
                    <>
                        {legacyUI ? (
                            <Card className="legacy-settlement">
                                <h2>{formatMonthKey(selectedMonth)} total: {formatCents(settlement.totalCents)}</h2>
                                {[
                                    ["Shared expenses", "sharedCents"],
                                    ["Purchases made on behalf of the other", "nonSplitCents"],
                                ].map(([label, field]) => (
                                    <div className="legacy-totals-group" key={field}>
                                        <h3>{label}</h3>
                                        <div className="legacy-totals-row">
                                            {participants.map((name) => (
                                                <p key={name}>{name} spent: {formatCents(settlement.totals[name][field])}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="legacy-split-flow">
                                    <span aria-hidden="true">{settlement.owedCents > 0 ? "←" : settlement.owedCents < 0 ? "→" : "−"}</span>
                                    <p>{settlement.owedCents === 0 ? "No one owes the other" : `${debtor} owes ${creditor} ${formatCents(Math.abs(settlement.owedCents))}`}</p>
                                </div>
                            </Card>
                        ) : (
                            <>
                                <Card className="settlement-card">
                                    <span className="pill">{formatMonthKey(selectedMonth)}</span>
                                    <p className="settlement-caption">
                                        {settlement.owedCents === 0
                                            ? "No payment needed"
                                            : `${debtor} owes ${creditor}`}
                                    </p>
                                    <h2 className="hero-amount">
                                        {formatCents(Math.abs(settlement.owedCents))}
                                    </h2>
                                </Card>
                                <div className="section-topline breakdown-heading">
                                    <h2>Payments by person</h2>
                                    <span className="muted">
                                        Total {formatCents(settlement.totalCents)}
                                    </span>
                                </div>
                                <div className="participant-grid">
                                    {participants.map((name, index) => {
                                        const totals = settlement.totals[name];
                                        return (
                                            <Card className="participant-card" key={name}>
                                                <div className="participant-heading">
                                                    <span className={`avatar avatar--${index}`}>
                                                        {name.slice(0, 1).toUpperCase()}
                                                    </span>
                                                    <h3>{name}</h3>
                                                </div>
                                                <dl>
                                                    <div>
                                                        <dt>Shared expenses</dt>
                                                        <dd>{formatCents(totals.sharedCents)}</dd>
                                                    </div>
                                                    <div>
                                                        <dt>Paid for the other person</dt>
                                                        <dd>{formatCents(totals.nonSplitCents)}</dd>
                                                    </div>
                                                    <div className="participant-total">
                                                        <dt>Total paid</dt>
                                                        <dd>
                                                            {formatCents(
                                                                totals.sharedCents + totals.nonSplitCents,
                                                            )}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                        <p className="split-rules">
                            Shared expenses are split 50/50. Purchases for the other person are
                            charged in full.
                        </p>
                        {month.expenses.length === 0 && (
                            <Card className="empty-state">
                                <Icon name="wallet" size={34} />
                                <h3>No expenses</h3>
                                <p>There are no expenses in this month.</p>
                                <Link to="/new" className="text-link">
                                    Add an expense <Icon name="arrow" size={16} />
                                </Link>
                            </Card>
                        )}
                    </>
                )}
            </ProfileGate>
        </>
    );
}
