import { buildChartData, calculateSettlement, normalizeExpenseRecord } from "./expenses";

function expense(overrides = {}) {
    return {
        id: "expense-id",
        participantName: "Alex",
        amountCents: 1000,
        occurredAt: new Date(2026, 2, 4, 12),
        category: "Food",
        note: "",
        nonSplit: false,
        ...overrides
    };
}

describe("expense normalization", () => {
    test("reads legacy string amounts without losing cents", () => {
        expect(normalizeExpenseRecord("id", {
            name: "Alex",
            amount: "10.25",
            date: { seconds: 1_772_625_600 },
            category: "Food"
        })).toMatchObject({ amountCents: 1025, participantName: "Alex", nonSplit: false });
    });

    test("prefers canonical cents and rejects malformed records", () => {
        expect(normalizeExpenseRecord("id", {
            name: "Alex",
            amountCents: 999,
            amount: "1.00",
            date: { toDate: () => new Date(2026, 2, 4) }
        }).amountCents).toBe(999);
        expect(normalizeExpenseRecord("id", { name: "Alex", amount: "bad" })).toBeNull();
    });
});

describe("expense calculations", () => {
    test("aggregates decimals in one pass without truncation", () => {
        const result = buildChartData([
            expense({ id: "1", amountCents: 1025 }),
            expense({ id: "2", amountCents: 250 })
        ]);

        expect(result.daily[0].amount).toBe(12.75);
        expect(result.categories).toEqual([{ category: "Food", amount: 12.75 }]);
        expect(result.participants).toEqual([{ name: "Alex", amount: 12.75 }]);
    });

    test("settles shared and charged-in-full expenses in both directions", () => {
        const participants = ["Alex", "Sam"];
        expect(calculateSettlement([
            expense({ id: "1", participantName: "Alex", amountCents: 2000 }),
            expense({ id: "2", participantName: "Sam", amountCents: 1000 }),
            expense({ id: "3", participantName: "Sam", amountCents: 300, nonSplit: true })
        ], participants).owedCents).toBe(200);

        expect(calculateSettlement([
            expense({ id: "4", participantName: "Alex", amountCents: 500, nonSplit: true }),
            expense({ id: "5", participantName: "Sam", amountCents: 2000 })
        ], participants).owedCents).toBe(-500);
    });
});
