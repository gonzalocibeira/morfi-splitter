import { state, names, pause, scenario } from "./state";
export async function loadProfile() {
    await pause();
    return names;
}
export async function loadExpenses(uid, range) {
    state.reads += 1;
    await pause(scenario === "loading" ? 1800 : 35);
    if (scenario === "error" || state.failRefresh)
        throw new Error("Unable to reach your expenses. Please try again.");
    return state.expenses
        .filter(({ data }) => data.date >= range.start && data.date < range.end)
        .sort((left, right) => left.data.date - right.data.date)
        .map((entry) => ({ ...entry, data: { ...entry.data } }));
}
export async function addExpense(uid, input) {
    await pause();
    state.writes += 1;
    if (scenario === "write-error")
        throw new Error("Could not save the expense. Please try again.");
    const id = `created-${state.writes}`;
    state.expenses.push({
        id,
        data: {
            name: input.participantName,
            amountCents: input.amountCents,
            category: input.category,
            note: input.note,
            nonSplit: input.nonSplit,
            date: new Date(),
        },
    });
    if (scenario === "refresh-error") state.failRefresh = true;
    return id;
}
export async function changeAmount(uid, id, amountCents) {
    await pause();
    state.writes += 1;
    state.expenses.find((entry) => entry.id === id).data.amountCents = amountCents;
    if (scenario === "refresh-error") state.failRefresh = true;
}
export async function removeExpense(uid, id) {
    await pause();
    state.writes += 1;
    state.expenses = state.expenses.filter((entry) => entry.id !== id);
}
