import React, { useContext } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as store from "../components/firebase/expenseStore";
import { AuthContext } from "./AuthContext";
import FireProvider, { FireContext } from "./FireContext";
import { monthKeyFromDate } from "../domain/months";
jest.mock("../components/firebase/expenseStore", () => ({
    loadProfile: jest.fn(),
    loadExpenses: jest.fn(),
    addExpense: jest.fn(),
    changeAmount: jest.fn(),
    removeExpense: jest.fn(),
}));
jest.mock("../components/firebase/firestore", () => ({ firebaseConfigurationError: null }));
function deferred() {
    let resolve, reject;
    const promise = new Promise((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return { promise, resolve, reject };
}
function records(id, amountCents = 100) {
    return [
        {
            id,
            data: {
                name: "Alex",
                amountCents,
                date: new Date(2026, 2, 4),
                category: "Food",
                nonSplit: false,
            },
        },
    ];
}
let api;
function Consumer({ monthKey = "2026-03" }) {
    api = useContext(FireContext);
    return (
        <>
            <p>{api.participants.join(",")}</p>
            <output data-testid="month">{JSON.stringify(api.getMonth(monthKey))}</output>
            <output data-testid="pending">{JSON.stringify(api.pendingOperations)}</output>
        </>
    );
}
function tree(uid = "owner", monthKey) {
    return (
        <AuthContext.Provider value={{ user: uid ? { uid } : null }}>
            <FireProvider>
                <Consumer monthKey={monthKey} />
            </FireProvider>
        </AuthContext.Provider>
    );
}
async function setup(monthKey) {
    const view = render(tree("owner", monthKey));
    await screen.findByText("Alex,Sam");
    return view;
}
beforeEach(() => {
    store.loadProfile.mockResolvedValue(["Alex", "Sam"]);
    store.loadExpenses.mockResolvedValue([]);
});
afterEach(() => jest.restoreAllMocks());
test("loads the profile and ignores a late request for the same month", async () => {
    const first = deferred(),
        second = deferred();
    store.loadExpenses.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    await setup();
    let one, two;
    act(() => {
        one = api.loadMonth("2026-03", { force: true });
        two = api.loadMonth("2026-03", { force: true });
    });
    await waitFor(() => expect(store.loadExpenses).toHaveBeenCalledTimes(2));
    await act(async () => {
        second.resolve(records("newer"));
        await two;
    });
    await act(async () => {
        first.resolve(records("older"));
        await one;
    });
    expect(screen.getByTestId("month")).toHaveTextContent("newer");
    expect(screen.getByTestId("month")).not.toHaveTextContent("older");
});
test("an older rejected request cannot overwrite a newer success", async () => {
    const first = deferred(),
        second = deferred();
    store.loadExpenses.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    await setup();
    let one, two;
    act(() => {
        one = api.loadMonth("2026-03", { force: true }).catch(() => undefined);
        two = api.loadMonth("2026-03", { force: true });
    });
    await waitFor(() => expect(store.loadExpenses).toHaveBeenCalledTimes(2));
    await act(async () => {
        second.resolve(records("newer"));
        await two;
    });
    await act(async () => {
        first.reject(new Error("old failure"));
        await one;
    });
    expect(api.getMonth("2026-03").status).toBe("success");
    expect(api.getMonth("2026-03").error).toBeNull();
});
test("deduplicates in-flight month requests and caches them for 60 seconds", async () => {
    const pending = deferred();
    store.loadExpenses.mockReturnValueOnce(pending.promise);
    const now = jest.spyOn(Date, "now").mockReturnValue(100000);
    await setup();
    let first, second;
    act(() => {
        first = api.loadMonth("2026-03");
        second = api.loadMonth("2026-03");
    });
    expect(first).toBe(second);
    await act(async () => {
        pending.resolve(records("one"));
        await first;
    });
    await act(async () => {
        await api.loadMonth("2026-03");
    });
    expect(store.loadExpenses).toHaveBeenCalledTimes(1);
    now.mockReturnValue(160001);
    await act(async () => {
        await api.loadMonth("2026-03");
    });
    expect(store.loadExpenses).toHaveBeenCalledTimes(2);
});
test("retains a committed amount when its background refresh fails", async () => {
    store.loadExpenses
        .mockResolvedValueOnce(records("one"))
        .mockRejectedValueOnce(new Error("offline"));
    store.changeAmount.mockResolvedValue();
    await setup();
    await act(async () => {
        await api.loadMonth("2026-03");
    });
    await act(async () => {
        await expect(api.updateExpenseAmount("one", "2026-03", 222)).resolves.toBeUndefined();
    });
    await waitFor(() => expect(api.getMonth("2026-03").warning).toMatch(/saved changes are safe/));
    expect(api.getMonth("2026-03").expenses[0].amountCents).toBe(222);
    expect(api.getMonth("2026-03").status).toBe("success");
});
test("deduplicates the same mutation and tracks different pending rows independently", async () => {
    const first = deferred(),
        second = deferred();
    store.changeAmount.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    await setup();
    let one, duplicate, two;
    act(() => {
        one = api.updateExpenseAmount("one", "2026-03", 200);
        duplicate = api.updateExpenseAmount("one", "2026-03", 200);
        two = api.updateExpenseAmount("two", "2026-03", 300);
    });
    expect(one).toBe(duplicate);
    await waitFor(() => expect(store.changeAmount).toHaveBeenCalledTimes(2));
    expect(api.pendingOperations).toEqual({ one: true, two: true });
    await act(async () => {
        first.resolve();
        await one;
    });
    expect(api.pendingOperations).toEqual({ two: true });
    await act(async () => {
        second.resolve();
        await two;
    });
    expect(api.pendingOperations).toEqual({});
});
test("a successful create remains successful when the refresh fails, without duplicate writes", async () => {
    const key = monthKeyFromDate(new Date());
    const pending = deferred();
    store.addExpense.mockReturnValue(pending.promise);
    store.loadExpenses.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error("offline"));
    await setup(key);
    await act(async () => {
        await api.loadMonth(key);
    });
    const input = {
        participantName: "Alex",
        amountCents: 1234,
        category: "Food",
        note: "test",
        nonSplit: false,
    };
    let first, duplicate;
    act(() => {
        first = api.createExpense(input);
        duplicate = api.createExpense(input);
    });
    expect(first).toBe(duplicate);
    await act(async () => {
        pending.resolve("saved-id");
        await first;
    });
    await waitFor(() => expect(api.getMonth(key).warning).toBeTruthy());
    expect(store.addExpense).toHaveBeenCalledTimes(1);
    expect(api.getMonth(key).expenses[0]).toMatchObject({ id: "saved-id", amountCents: 1234 });
});
test("failed writes retain cached data and clear only their own pending status", async () => {
    store.loadExpenses.mockResolvedValue(records("one"));
    store.removeExpense.mockRejectedValue(new Error("write denied"));
    await setup();
    await act(async () => {
        await api.loadMonth("2026-03");
    });
    await act(async () => {
        await expect(api.deleteExpense("one", "2026-03")).rejects.toThrow("write denied");
    });
    expect(api.getMonth("2026-03").expenses).toHaveLength(1);
    expect(api.pendingOperations).toEqual({});
    expect(store.loadExpenses).toHaveBeenCalledTimes(1);
});
test("late reads from a previous account cannot change the new account", async () => {
    const pending = deferred();
    store.loadExpenses
        .mockReturnValueOnce(pending.promise)
        .mockResolvedValueOnce(records("new-account"));
    const view = await setup();
    let old;
    act(() => {
        old = api.loadMonth("2026-03");
    });
    await waitFor(() => expect(store.loadExpenses).toHaveBeenCalledTimes(1));
    view.rerender(tree("other"));
    await waitFor(() => expect(store.loadProfile).toHaveBeenCalledWith("other"));
    await act(async () => {
        await api.loadMonth("2026-03");
    });
    await act(async () => {
        pending.resolve(records("old-account"));
        await old;
    });
    expect(screen.getByTestId("month")).toHaveTextContent("new-account");
    expect(screen.getByTestId("month")).not.toHaveTextContent("old-account");
});
test("a read started before a committed edit cannot erase its cache patch", async () => {
    const older = deferred(),
        refreshed = deferred();
    store.loadExpenses
        .mockResolvedValueOnce(records("one", 100))
        .mockReturnValueOnce(older.promise)
        .mockReturnValueOnce(refreshed.promise);
    store.changeAmount.mockResolvedValue();
    await setup();
    await act(async () => {
        await api.loadMonth("2026-03");
    });
    let oldRead;
    act(() => {
        oldRead = api.loadMonth("2026-03", { force: true });
    });
    await waitFor(() => expect(store.loadExpenses).toHaveBeenCalledTimes(2));
    await act(async () => {
        await api.updateExpenseAmount("one", "2026-03", 999);
    });
    await act(async () => {
        older.resolve(records("one", 100));
        await oldRead;
    });
    expect(api.getMonth("2026-03").expenses[0].amountCents).toBe(999);
    await act(async () => {
        refreshed.resolve(records("one", 999));
    });
});
test("a committed create without a previously cached month has a refresh warning, not a write failure", async () => {
    const key = monthKeyFromDate(new Date());
    store.addExpense.mockResolvedValue("saved");
    store.loadExpenses.mockRejectedValue(new Error("offline"));
    await setup(key);
    await act(async () => {
        await expect(
            api.createExpense({ participantName: "Alex", amountCents: 1234 }),
        ).resolves.toBe("saved");
    });
    await waitFor(() =>
        expect(api.getMonth(key).warning).toMatch(/do not submit the expense again/),
    );
    expect(api.pendingOperations).toEqual({});
});
