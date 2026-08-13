import { monthKeyFromDate, monthRangeFromKey } from "./months";

describe("months", () => {
    test("uses local calendar months", () => {
        expect(monthKeyFromDate(new Date(2026, 0, 31, 23, 30))).toBe("2026-01");
    });

    test("creates adjacent local boundaries across year changes", () => {
        const range = monthRangeFromKey("2025-12");
        expect(range.start).toEqual(new Date(2025, 11, 1));
        expect(range.end).toEqual(new Date(2026, 0, 1));
    });

    test("creates correct boundaries for a month containing a DST transition", () => {
        const range = monthRangeFromKey("2026-03");
        expect(range.start.getDate()).toBe(1);
        expect(range.start.getHours()).toBe(0);
        expect(range.end).toEqual(new Date(2026, 3, 1));
    });

    test("rejects malformed month keys", () => {
        expect(monthRangeFromKey("2026-13")).toBeNull();
        expect(monthRangeFromKey(null)).toBeNull();
    });
});
