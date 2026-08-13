import React, { useContext, useEffect, useState } from "react";
import { Supermarket, Food, Utilities, Other } from "../../assets/icons";
import { FireContext } from "../../Context/FireContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { centsToInputValue, formatCents, parseMoneyToCents } from "../../domain/money";
import { formatExpenseDate } from "../../domain/months";

const confirmationDialog = withReactContent(Swal);
const CATEGORY_ICONS = { Supermarket, Food, Utilities, Other };

export default function Detailedview({ expense, monthKey, participants }) {
    const { deleteExpense, updateExpenseAmount, mutationState } = useContext(FireContext);
    const [optionsView, setOptionsView] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newAmount, setNewAmount] = useState(centsToInputValue(expense.amountCents));
    const [rowError, setRowError] = useState(null);
    const isPending = mutationState.pending && mutationState.id === expense.id;

    useEffect(() => {
        setNewAmount(centsToInputValue(expense.amountCents));
    }, [expense.amountCents]);

    const confirmDelete = async () => {
        const result = await confirmationDialog.fire({
            title: <strong>Are you sure?</strong>,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f44336",
            cancelButtonColor: "#B0BEC5",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            width: "90vw"
        });

        if (!result.isConfirmed) {
            return;
        }

        setRowError(null);
        try {
            await deleteExpense(expense.id, monthKey);
        } catch (error) {
            setRowError(error.message);
        }
    };

    const saveAmount = async () => {
        const amountCents = parseMoneyToCents(newAmount);
        if (!amountCents) {
            setRowError("Enter a positive amount with no more than two decimals.");
            return;
        }

        setRowError(null);
        try {
            await updateExpenseAmount(expense.id, monthKey, amountCents);
            setEditMode(false);
            setOptionsView(false);
        } catch (error) {
            setRowError(error.message);
        }
    };

    const expenseIcon = CATEGORY_ICONS[expense.category] || Other;

    return (
        <div
            className="detailedExpense"
            data-aos={expense.participantName === participants[0] ? "fade-right" : "fade-left"}
            style={expense.participantName === participants[1] ? { marginLeft: "auto" } : { marginLeft: 10 }}
        >
            <img className="expenseIcon" src={expenseIcon} alt="" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{ borderBottom: "1px solid white", marginBottom: -5 }}>
                    {formatExpenseDate(expense.occurredAt)} - <strong>{expense.participantName}</strong>
                </p>
                <p>{formatCents(expense.amountCents)} on {expense.category}</p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    {expense.note && <p style={{ marginTop: "-5px", textAlign: "center" }}>Note: {expense.note}</p>}
                    {expense.nonSplit && (
                        <p style={{ marginTop: "-5px", textAlign: "center", color: "RGB(70,61,134)", backgroundColor: "white", width: "90%", fontWeight: 700, borderRadius: "2px" }}>
                            Purchase made for the other user
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    aria-expanded={optionsView}
                    aria-label="Expense options"
                    style={{ backgroundColor: "LightGray", border: "none", color: "black", borderRadius: "2px", minWidth: "40px" }}
                    onClick={() => setOptionsView((visible) => !visible)}
                >
                    {optionsView ? "▲" : "▼"}
                </button>
                {optionsView && (
                    <div>
                        <button
                            type="button"
                            disabled={isPending}
                            style={{ backgroundColor: "#1DE9B6", border: "none", color: "#263238", marginTop: "20px", marginBottom: "5px", borderRadius: "2px", marginRight: "5px" }}
                            onClick={() => setEditMode((editing) => !editing)}
                        >
                            Edit amount
                        </button>
                        <button
                            type="button"
                            disabled={isPending}
                            style={{ backgroundColor: "#f44336", border: "none", color: "white", marginTop: "20px", marginBottom: "5px", borderRadius: "2px" }}
                            onClick={confirmDelete}
                        >
                            {isPending ? "Working…" : "Delete entry"}
                        </button>
                    </div>
                )}
                {editMode && (
                    <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                        <input
                            aria-label="New amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={newAmount}
                            disabled={isPending}
                            onChange={(event) => setNewAmount(event.target.value)}
                            style={{ width: "70px", marginRight: "5px" }}
                        />
                        <button
                            type="button"
                            disabled={isPending}
                            style={{ backgroundColor: "#1DE9B6", border: "none", color: "#263238", borderRadius: "2px" }}
                            onClick={saveAmount}
                        >
                            {isPending ? "Saving…" : "Save"}
                        </button>
                    </div>
                )}
                {rowError && <p className="errorMsg" role="alert">{rowError}</p>}
            </div>
        </div>
    );
}
