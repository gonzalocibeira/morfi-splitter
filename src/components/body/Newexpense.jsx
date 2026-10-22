import React, { useContext, useRef, useState } from "react";
import { FireContext } from "../../Context/FireContext";
import { parseMoneyToCents } from "../../domain/money";
import { monthKeyFromDate } from "../../domain/months";
import { Button, Card, MonthStatus, Notice, PageTitle, ProfileGate } from "../ui/Primitives";
import Icon from "../ui/Icon";
const INITIAL_FORM = {
    participantName: "",
    amount: "",
    category: "Supermarket",
    note: "",
    nonSplit: false,
};
export default function Newexpense() {
    const {
        participants,
        createExpense,
        getMonth,
        pendingOperations = {},
    } = useContext(FireContext);
    const monthKey = monthKeyFromDate(new Date());
    const month = getMonth(monthKey);
    const [form, setForm] = useState(INITIAL_FORM);
    const [formError, setFormError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [localPending, setLocalPending] = useState(false);
    const submitting = useRef(false);
    const amountRef = useRef(null);
    const isSubmitting = localPending || Boolean(pendingOperations.create);
    const setField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setFormError(null);
        setSuccessMessage(null);
    };
    const reset = () => {
        setForm(INITIAL_FORM);
        setFormError(null);
        setSuccessMessage(null);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting.current || isSubmitting) return;
        const amountCents = parseMoneyToCents(form.amount);
        if (!participants.includes(form.participantName) || !amountCents) {
            setFormError(
                "Choose a participant and enter a positive amount with no more than two decimals.",
            );
            if (!amountCents) amountRef.current?.focus();
            return;
        }
        submitting.current = true;
        setLocalPending(true);
        setFormError(null);
        setSuccessMessage(null);
        try {
            await createExpense({
                participantName: form.participantName,
                amountCents,
                category: form.category,
                note: form.note.trim(),
                nonSplit: form.nonSplit,
            });
            setForm(INITIAL_FORM);
            setSuccessMessage("Expense added.");
        } catch (error) {
            setFormError(error.message);
        } finally {
            submitting.current = false;
            setLocalPending(false);
        }
    };
    const other = participants.find((name) => name !== form.participantName);
    return (
        <>
            <PageTitle title="Add expense" icon="plus">
                Recorded with today's date.
            </PageTitle>
            <ProfileGate>
                <Card className="expense-entry-card">
                    <form className="stack-form" onSubmit={handleSubmit}>
                        <fieldset disabled={isSubmitting} className="form-fields">
                            <div className="form-row">
                                <div className="field">
                                    <label htmlFor="expense-participant">Paid by</label>
                                    <select
                                        id="expense-participant"
                                        value={form.participantName}
                                        required
                                        onChange={(event) =>
                                            setField("participantName", event.target.value)
                                        }
                                    >
                                        <option value="">Choose a participant</option>
                                        {participants.map((participant) => (
                                            <option key={participant} value={participant}>
                                                {participant}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <label className="field">
                                    Amount
                                    <span className="amount-input">
                                        <span aria-hidden="true">€</span>
                                        <input
                                            ref={amountRef}
                                            type="text"
                                            inputMode="decimal"
                                            aria-label="Amount"
                                            placeholder="0.00"
                                            value={form.amount}
                                            required
                                            aria-describedby="amount-hint"
                                            aria-invalid={Boolean(
                                                formError && !parseMoneyToCents(form.amount),
                                            )}
                                            onChange={(event) =>
                                                setField("amount", event.target.value)
                                            }
                                        />
                                    </span>
                                    <small id="amount-hint" className="srOnly">
                                        Use a comma or a dot for cents.
                                    </small>
                                </label>
                            </div>
                            <div className="field">
                                <label htmlFor="expense-category">Category</label>
                                <select
                                    id="expense-category"
                                    value={form.category}
                                    onChange={(event) => setField("category", event.target.value)}
                                >
                                    <option>Supermarket</option>
                                    <option>Food</option>
                                    <option>Utilities</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <label className={`split-toggle${form.nonSplit ? " is-checked" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={form.nonSplit}
                                    onChange={(event) => setField("nonSplit", event.target.checked)}
                                />
                                <span>
                                    <strong>Charge the other person in full</strong>
                                    <small>
                                        {form.nonSplit && form.participantName
                                            ? `${other} will owe ${form.participantName} the full amount.`
                                            : "Otherwise, split this expense equally."}
                                    </small>
                                </span>
                            </label>
                            <label className="field">
                                Note{" "}
                                <span className="optional" aria-hidden="true">
                                    optional
                                </span>
                                <textarea
                                    placeholder="What was it for?"
                                    rows={3}
                                    value={form.note}
                                    onChange={(event) => setField("note", event.target.value)}
                                />
                            </label>
                        </fieldset>
                        {formError && <Notice>{formError}</Notice>}
                        {successMessage && (
                            <Notice variant="success">
                                <Icon name="check" size={18} />
                                {successMessage}
                            </Notice>
                        )}
                        {month.warning && <MonthStatus month={month} monthKey={monthKey} />}
                        <div className="form-actions">
                            <Button
                                variant="secondary"
                                type="button"
                                disabled={isSubmitting}
                                onClick={reset}
                            >
                                Clear
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                <Icon name="plus" size={18} />
                                {isSubmitting ? "Saving…" : "Save expense"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </ProfileGate>
        </>
    );
}
