import {
    addDoc,
    collection,
    doc,
    deleteDoc,
    deleteField,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { addExpense, changeAmount, loadExpenses, loadProfile, removeExpense } from "./expenseStore";
jest.mock("./firestore", () => ({ firebaseApp: {} }));
jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => "database"),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    deleteField: jest.fn(() => "delete-legacy"),
    collection: jest.fn((...parts) => parts.join("/")),
    doc: jest.fn((...parts) => parts.join("/")),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn((...parts) => parts),
    serverTimestamp: jest.fn(() => "server-time"),
    updateDoc: jest.fn(),
    where: jest.fn((...parts) => parts),
    orderBy: jest.fn((...parts) => parts),
    Timestamp: { fromDate: (date) => date },
}));
beforeEach(() => {
    collection.mockImplementation((...parts) => parts.join("/"));
    doc.mockImplementation((...parts) => parts.join("/"));
    query.mockImplementation((...parts) => parts);
});
test("loads exactly the household profile document", async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ names: ["Alex", "Sam"] }) });
    expect(await loadProfile("owner")).toEqual(["Alex", "Sam"]);
    expect(getDoc).toHaveBeenCalledWith("database/users/owner");
});
test("queries only the requested month and retains Firestore document IDs", async () => {
    const range = { start: new Date(2026, 9, 1), end: new Date(2026, 10, 1) };
    getDocs.mockResolvedValue({ docs: [{ id: "stable-id", data: () => ({ amount: "12.34" }) }] });
    expect(await loadExpenses("owner", range)).toEqual([
        { id: "stable-id", data: { amount: "12.34" } },
    ]);
    expect(where).toHaveBeenCalledWith("date", ">=", range.start);
    expect(where).toHaveBeenCalledWith("date", "<", range.end);
    expect(query.mock.calls[0][0]).toBe("database/expenses/owner/monthly");
});
test("creates canonical cent amounts using the server creation timestamp", async () => {
    addDoc.mockResolvedValue({ id: "created" });
    serverTimestamp.mockReturnValue("server-time");
    const input = {
        participantName: "Alex",
        amountCents: 1234,
        category: "Food",
        note: "Lunch",
        nonSplit: true,
    };
    expect(await addExpense("owner", input)).toBe("created");
    expect(addDoc).toHaveBeenCalledWith("database/expenses/owner/monthly", {
        name: "Alex",
        amountCents: 1234,
        date: "server-time",
        category: "Food",
        note: "Lunch",
        nonSplit: true,
    });
});
test("amount edits remove the legacy amount field and deletes address the stable document ID", async () => {
    deleteField.mockReturnValue("delete-legacy");
    await changeAmount("owner", "stable-id", 5678);
    expect(updateDoc).toHaveBeenCalledWith("database/expenses/owner/monthly/stable-id", {
        amountCents: 5678,
        amount: "delete-legacy",
    });
    await removeExpense("owner", "stable-id");
    expect(deleteDoc).toHaveBeenCalledWith("database/expenses/owner/monthly/stable-id");
});
