import React, { useContext } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { getDoc, getDocs } from "firebase/firestore";
import { AuthContext } from "./AuthContext";
import FireProvider, { FireContext } from "./FireContext";

jest.mock("firebase/firestore", () => ({
    addDoc: jest.fn(),
    collection: jest.fn((...parts) => parts.join("/")),
    deleteDoc: jest.fn(),
    deleteField: jest.fn(() => "deleted"),
    doc: jest.fn((...parts) => parts.join("/")),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn((value) => value),
    serverTimestamp: jest.fn(),
    Timestamp: { fromDate: jest.fn((date) => date) },
    updateDoc: jest.fn(),
    where: jest.fn()
}));

jest.mock("../components/firebase/firestore", () => ({
    db: {},
    firebaseConfigurationError: null
}));

function deferred() {
    let resolve;
    const promise = new Promise((done) => { resolve = done; });
    return { promise, resolve };
}

function snapshot(id, amountCents) {
    return {
        docs: [{
            id,
            data: () => ({
                name: "Alex",
                amountCents,
                date: { toDate: () => new Date(2026, 2, 4) },
                category: "Food",
                note: "",
                nonSplit: false
            })
        }]
    };
}

function Consumer() {
    const { participants, getMonth, loadMonth } = useContext(FireContext);
    const month = getMonth("2026-03");
    return (
        <>
            <p>{participants.join(",")}</p>
            <p data-testid="ids">{month.expenses.map((expense) => expense.id).join(",")}</p>
            <button onClick={() => loadMonth("2026-03", { force: true }).catch(() => undefined)}>load</button>
        </>
    );
}

test("loads the profile and ignores a late request for the same month", async () => {
    const first = deferred();
    const second = deferred();
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ names: ["Alex", "Sam"] }) });
    getDocs.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    render(
        <AuthContext.Provider value={{ user: { uid: "owner" } }}>
            <FireProvider><Consumer /></FireProvider>
        </AuthContext.Provider>
    );

    await waitFor(() => expect(screen.getByText("Alex,Sam")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "load" }));
    fireEvent.click(screen.getByRole("button", { name: "load" }));

    await act(async () => second.resolve(snapshot("newer", 200)));
    await waitFor(() => expect(screen.getByTestId("ids")).toHaveTextContent("newer"));

    await act(async () => first.resolve(snapshot("older", 100)));
    expect(screen.getByTestId("ids")).toHaveTextContent("newer");
});
