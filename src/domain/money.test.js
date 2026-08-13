import { centsToInputValue, parseMoneyToCents } from "./money";

describe("money", () => {
    test.each([
        ["12", 1200],
        ["12.3", 1230],
        ["12.34", 1234],
        ["12,34", 1234],
        [0.01, 1]
    ])("parses %p into integer cents", (value, expected) => {
        expect(parseMoneyToCents(value)).toBe(expected);
    });

    test.each(["", "0", 0, "-1", "1.234", "abc", Infinity, null, undefined])(
        "rejects invalid amount %p",
        (value) => expect(parseMoneyToCents(value)).toBeNull()
    );

    test("formats cents for an amount input", () => {
        expect(centsToInputValue(1234)).toBe("12.34");
    });
});
