import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MonthPicker from "./MonthPicker";

test("selects the exact month key and clears the selection", () => {
    const onChange = jest.fn();
    render(<MonthPicker value="2026-10" onChange={onChange} />);
    const input = screen.getByLabelText("Expense month");
    expect(input).toHaveValue("2026-10");

    fireEvent.change(input, { target: { value: "2026-01" } });
    expect(onChange).toHaveBeenLastCalledWith("2026-01");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(null);
});

test("lets fallback browsers type a month without emitting partial dates", () => {
    const onChange = jest.fn();
    const { rerender } = render(<MonthPicker value={null} onChange={onChange} />);
    const input = screen.getByLabelText("Expense month");
    input.type = "text";

    fireEvent.change(input, { target: { value: "2026-" } });
    expect(input).toHaveValue("2026-");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "2026-12" } });
    expect(onChange).toHaveBeenLastCalledWith("2026-12");
    rerender(<MonthPicker value="2027-01" onChange={onChange} />);
    expect(input).toHaveValue("2027-01");
});
