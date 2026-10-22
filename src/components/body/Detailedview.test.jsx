import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Detailedview from "./Detailedview";
const expense = {
    id: "stable-document-id",
    participantName: "Alex",
    amountCents: 1234,
    occurredAt: new Date(2026, 2, 4),
    category: "Food",
    note: "Lunch",
    nonSplit: false,
};
function setup(props = {}) {
    const updateExpenseAmount = jest.fn().mockResolvedValue();
    const deleteExpense = jest.fn().mockResolvedValue();
    render(
        <Detailedview
            expense={expense}
            monthKey="2026-03"
            updateExpenseAmount={updateExpenseAmount}
            deleteExpense={deleteExpense}
            {...props}
        />,
    );
    return { updateExpenseAmount, deleteExpense };
}
function edit() {
    fireEvent.click(screen.getByRole("button", { name: "Expense options" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit amount" }));
}
test("opens expense options on the first click", () => {
    setup();
    const options = screen.getByRole("button", { name: "Expense options" });
    expect(options).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(options);
    expect(options).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Edit amount" })).toBeInTheDocument();
});
test("rejects an invalid edited amount without writing", () => {
    const { updateExpenseAmount } = setup();
    edit();
    fireEvent.change(screen.getByRole("textbox", { name: "New amount" }), {
        target: { value: "1.234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));
    expect(updateExpenseAmount).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("no more than two decimals");
});
test("accepts decimal commas while editing and supports Enter to save", async () => {
    const { updateExpenseAmount } = setup();
    edit();
    const input = screen.getByRole("textbox", { name: "New amount" });
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: "22,45" } });
    await act(async () => {
        fireEvent.submit(input.closest("form"));
    });
    expect(updateExpenseAmount).toHaveBeenCalledWith(expense.id, "2026-03", 2245);
    expect(screen.queryByRole("textbox", { name: "New amount" })).not.toBeInTheDocument();
});
test("Cancel discards the edited amount and returns focus", () => {
    setup();
    edit();
    fireEvent.change(screen.getByLabelText("New amount"), { target: { value: "99" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Edit amount" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Edit amount" }));
    expect(screen.getByLabelText("New amount")).toHaveValue("12.34");
});
test("delete confirmation names the expense, cancels safely, and deletes only on confirmation", async () => {
    const { deleteExpense } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Expense options" }));
    const trigger = screen.getByRole("button", { name: "Delete entry" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toHaveTextContent("Lunch");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(deleteExpense).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Delete expense" }));
    });
    expect(deleteExpense).toHaveBeenCalledWith(expense.id, "2026-03");
});
