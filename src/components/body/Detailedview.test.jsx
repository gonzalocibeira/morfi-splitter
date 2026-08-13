import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FireContext } from "../../Context/FireContext";
import Detailedview from "./Detailedview";

jest.mock("sweetalert2-react-content", () => () => ({ fire: jest.fn() }));

const expense = {
    id: "stable-document-id",
    participantName: "Alex",
    amountCents: 1234,
    occurredAt: new Date(2026, 2, 4),
    category: "Food",
    note: "",
    nonSplit: false
};

test("opens expense options on the first click", () => {
    render(
        <FireContext.Provider value={{
            deleteExpense: jest.fn(),
            updateExpenseAmount: jest.fn(),
            mutationState: { pending: false, id: null, error: null }
        }}>
            <Detailedview expense={expense} monthKey="2026-03" participants={["Alex", "Sam"]} />
        </FireContext.Provider>
    );

    const options = screen.getByRole("button", { name: "Expense options" });
    expect(options).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(options);
    expect(options).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Edit amount" })).toBeInTheDocument();
});

test("rejects an invalid edited amount without writing", () => {
    const updateExpenseAmount = jest.fn();
    render(
        <FireContext.Provider value={{
            deleteExpense: jest.fn(),
            updateExpenseAmount,
            mutationState: { pending: false, id: null, error: null }
        }}>
            <Detailedview expense={expense} monthKey="2026-03" participants={["Alex", "Sam"]} />
        </FireContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Expense options" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit amount" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "New amount" }), { target: { value: "1.234" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(updateExpenseAmount).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("no more than two decimals");
});
