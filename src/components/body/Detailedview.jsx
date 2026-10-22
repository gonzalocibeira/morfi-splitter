import React, { memo, useEffect, useRef, useState } from "react";
import { centsToInputValue, formatCents, parseMoneyToCents } from "../../domain/money";
import { formatExpenseDate } from "../../domain/months";
import { Button, Notice } from "../ui/Primitives";
import Icon from "../ui/Icon";
import ConfirmDialog from "../ui/ConfirmDialog";
const colors = { Supermarket: "sage", Food: "peach", Utilities: "lavender", Other: "blue" };
function Detailedview({ expense, monthKey, pending = false, deleteExpense, updateExpenseAmount }) {
    const [optionsView, setOptionsView] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newAmount, setNewAmount] = useState(centsToInputValue(expense.amountCents));
    const [rowError, setRowError] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [localPending, setLocalPending] = useState(false);
    const lock = useRef(false);
    const editButton = useRef(null);
    const optionsButton = useRef(null);
    const amountInput = useRef(null);
    const isPending = pending || localPending;
    useEffect(() => {
        if (!editMode) setNewAmount(centsToInputValue(expense.amountCents));
    }, [expense.amountCents, editMode]);
    useEffect(() => {
        if (editMode) amountInput.current?.focus();
    }, [editMode]);
    const cancelEdit = () => {
        setEditMode(false);
        setRowError(null);
        setNewAmount(centsToInputValue(expense.amountCents));
        editButton.current?.focus();
    };
    const confirmDelete = async () => {
        if (lock.current || isPending) return;
        setConfirmOpen(false);
        setRowError(null);
        lock.current = true;
        setLocalPending(true);
        try {
            await deleteExpense(expense.id, monthKey);
        } catch (error) {
            setRowError(error.message);
        } finally {
            lock.current = false;
            setLocalPending(false);
        }
    };
    const saveAmount = async (event) => {
        event.preventDefault();
        if (lock.current || isPending) return;
        const amountCents = parseMoneyToCents(newAmount);
        if (!amountCents) {
            setRowError("Enter a positive amount with no more than two decimals.");
            amountInput.current?.focus();
            return;
        }
        setRowError(null);
        lock.current = true;
        setLocalPending(true);
        try {
            await updateExpenseAmount(expense.id, monthKey, amountCents);
            setEditMode(false);
            setOptionsView(false);
            optionsButton.current?.focus();
        } catch (error) {
            setRowError(error.message);
        } finally {
            lock.current = false;
            setLocalPending(false);
        }
    };
    return (
        <article
            className="expense-row"
            aria-label={`${expense.category} expense by ${expense.participantName}`}
            aria-busy={isPending}
        >
            <div className="expense-row-main">
                <span
                    className={`category-icon category-icon--${colors[expense.category] || "blue"}`}
                >
                    <Icon name={expense.category} />
                </span>
                <div className="expense-row-info">
                    <h3>{expense.category}</h3>
                    <p>
                        <strong>{expense.participantName}</strong>
                        <span aria-hidden="true"> · </span>
                        <time dateTime={expense.occurredAt.toISOString()}>
                            {formatExpenseDate(expense.occurredAt)}
                        </time>
                    </p>
                </div>
                <strong className="expense-amount">{formatCents(expense.amountCents)}</strong>
                <button
                    ref={optionsButton}
                    type="button"
                    className="icon-button expense-options"
                    aria-expanded={optionsView}
                    aria-label="Expense options"
                    disabled={isPending}
                    onClick={() => {
                        setOptionsView((visible) => !visible);
                        if (optionsView) {
                            setEditMode(false);
                            setRowError(null);
                        }
                    }}
                >
                    <Icon name={optionsView ? "close" : "chevron"} size={19} />
                </button>
            </div>
            {(expense.note || expense.nonSplit) && (
                <div className="expense-row-extra">
                    {expense.note && <p className="expense-note">{expense.note}</p>}
                    {expense.nonSplit && (
                        <span className="expense-tag">
                            Paid for the other person · charged in full
                        </span>
                    )}
                </div>
            )}
            {optionsView && (
                <div className="expense-row-actions">
                    <button
                        ref={editButton}
                        type="button"
                        className="button button--secondary"
                        disabled={isPending}
                        onClick={() => {
                            setEditMode(true);
                            setRowError(null);
                        }}
                    >
                        <Icon name="edit" size={16} />
                        Edit amount
                    </button>
                    <Button
                        variant="danger-quiet"
                        disabled={isPending}
                        onClick={(event) => {
                            event.currentTarget.focus();
                            setConfirmOpen(true);
                        }}
                    >
                        <Icon name="trash" size={16} />
                        {isPending ? "Working…" : "Delete entry"}
                    </Button>
                </div>
            )}
            {editMode && (
                <form className="edit-amount-form" onSubmit={saveAmount}>
                    <label className="field">
                        New amount
                        <input
                            ref={amountInput}
                            type="text"
                            inputMode="decimal"
                            value={newAmount}
                            disabled={isPending}
                            onChange={(event) => {
                                setNewAmount(event.target.value);
                                setRowError(null);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    event.preventDefault();
                                    cancelEdit();
                                }
                            }}
                        />
                    </label>
                    <div className="edit-amount-buttons">
                        <Button
                            variant="secondary"
                            type="button"
                            disabled={isPending}
                            onClick={cancelEdit}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </form>
            )}
            {rowError && <Notice>{rowError}</Notice>}
            <ConfirmDialog
                open={confirmOpen}
                title="Delete this expense?"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
            >
                {expense.participantName}'s {expense.category.toLowerCase()} expense of{" "}
                {formatCents(expense.amountCents)}
                {expense.note ? ` — ${expense.note}` : ""} will be permanently deleted.
            </ConfirmDialog>
        </article>
    );
}
export default memo(Detailedview);
