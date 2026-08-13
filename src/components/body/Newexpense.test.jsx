import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FireContext } from "../../Context/FireContext";
import Newexpense from "./Newexpense";

function deferred() {
    let resolve;
    const promise = new Promise((done) => { resolve = done; });
    return { promise, resolve };
}

function renderForm(createExpense = jest.fn()) {
    render(
        <FireContext.Provider value={{
            participants: ["Alex", "Sam"],
            profileStatus: "success",
            profileError: null,
            createExpense,
            mutationState: { pending: false, id: null, error: null }
        }}>
            <Newexpense />
        </FireContext.Provider>
    );
    return createExpense;
}

test("validates money before creating an expense", () => {
    const createExpense = renderForm();
    fireEvent.change(screen.getByLabelText("Participant"), { target: { value: "Alex" } });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1.234" } });
    fireEvent.submit(screen.getByRole("button", { name: "Submit" }).closest("form"));

    expect(createExpense).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("no more than two decimals");
});

test("prevents duplicate submissions while a create is pending", async () => {
    const pending = deferred();
    const createExpense = renderForm(jest.fn(() => pending.promise));
    fireEvent.change(screen.getByLabelText("Participant"), { target: { value: "Alex" } });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "12.34" } });

    const submit = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submit);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Saving…" }));

    expect(createExpense).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve());
    expect(screen.getByRole("status")).toHaveTextContent("Expense added");
});
