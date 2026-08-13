import React, { useContext, useState } from "react";
import { FireContext } from "../../Context/FireContext";
import { parseMoneyToCents } from "../../domain/money";

const INITIAL_FORM = {
    participantName: "",
    amount: "",
    category: "Supermarket",
    note: "",
    nonSplit: false
};

export default function Newexpense() {
    const { participants, profileStatus, profileError, createExpense, mutationState } = useContext(FireContext);
    const [form, setForm] = useState(INITIAL_FORM);
    const [formError, setFormError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLocallySubmitting, setIsLocallySubmitting] = useState(false);
    const isSubmitting = isLocallySubmitting || (mutationState.pending && mutationState.id === "create");

    const setField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setFormError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) {
            return;
        }

        const amountCents = parseMoneyToCents(form.amount);
        if (!participants.includes(form.participantName) || !amountCents) {
            setFormError("Choose a participant and enter a positive amount with no more than two decimals.");
            return;
        }

        try {
            setIsLocallySubmitting(true);
            await createExpense({
                participantName: form.participantName,
                amountCents,
                category: form.category,
                note: form.note.trim(),
                nonSplit: form.nonSplit
            });
            setForm(INITIAL_FORM);
            setSuccessMessage("Expense added.");
        } catch (error) {
            setFormError(error.message);
        } finally {
            setIsLocallySubmitting(false);
        }
    };

    if (profileStatus === "loading") {
        return <p className="statusMsg">Loading household profile…</p>;
    }

    if (profileError || participants.length !== 2) {
        return <p className="errorMsg" role="alert">{profileError || "Two participants are required before adding expenses."}</p>;
    }

    return (
        <>
            <div className="newExpenseTitle">
                <h2>↓ Input new expense ↓</h2>
            </div>
            <div className="newExpenseCont">
                <form className="expenseForm" onSubmit={handleSubmit}>
                    <div className="newExpenseForm">
                        <div>
                            <label>
                                <span className="srOnly">Participant</span>
                                <select
                                    value={form.participantName}
                                    required
                                    onChange={(event) => setField("participantName", event.target.value)}
                                >
                                    <option value="">Choose a participant</option>
                                    {participants.map((participant) => (
                                        <option key={participant} value={participant}>{participant}</option>
                                    ))}
                                </select>
                            </label>
                            <label>&nbsp;spent&nbsp;
                                <input
                                    style={{ width: 70 }}
                                    type="number"
                                    inputMode="decimal"
                                    min="0.01"
                                    step="0.01"
                                    value={form.amount}
                                    required
                                    onChange={(event) => setField("amount", event.target.value)}
                                />
                            </label>
                            <label>€ on&nbsp;
                                <select value={form.category} onChange={(event) => setField("category", event.target.value)}>
                                    <option value="Supermarket">Supermarket</option>
                                    <option value="Food">Food</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                        </div>
                        <div style={{ marginTop: 15 }}>
                            <label>Don't split, charge in full to the other person!
                                <input
                                    type="checkbox"
                                    checked={form.nonSplit}
                                    onChange={(event) => setField("nonSplit", event.target.checked)}
                                />
                            </label>
                        </div>
                        <div style={{ marginTop: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <label>
                                <span className="srOnly">Note</span>
                                <textarea
                                    placeholder="Write a note (optional)"
                                    rows={5}
                                    cols={42}
                                    value={form.note}
                                    onChange={(event) => setField("note", event.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                    {(formError || mutationState.error) && (
                        <p className="errorMsg" role="alert">{formError || mutationState.error}</p>
                    )}
                    {successMessage && <p className="successMsg" role="status">{successMessage}</p>}
                    <div className="newExpenseBtns">
                        <button type="button" onClick={() => setForm(INITIAL_FORM)} className="btnClear" disabled={isSubmitting}>Clear</button>
                        <button type="submit" className="btnSubmit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving…" : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
