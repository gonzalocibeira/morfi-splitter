import "@testing-library/jest-dom";
import React, { useContext } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Link, Route, Routes } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import UIProvider, { UIContext } from "./UIContext";
import { monthKeyFromDate } from "../domain/months";
import Settings from "../components/body/Settings";
beforeEach(() => localStorage.clear());
function Page() {
    const { selectedMonth, setSelectedMonth } = useContext(UIContext);
    return (
        <>
            <output>{selectedMonth}</output>
            <button onClick={() => setSelectedMonth("2025-12")}>choose December</button>
            <Link to="/detail">details</Link>
            <Settings />
        </>
    );
}
function tree(uid) {
    return (
        <AuthContext.Provider value={{ user: { uid } }}>
            <MemoryRouter>
                <UIProvider>
                    <Routes>
                        <Route path="/" element={<Page />} />
                        <Route path="/detail" element={<Page />} />
                    </Routes>
                </UIProvider>
            </MemoryRouter>
        </AuthContext.Provider>
    );
}
test("starts on the current month, preserves selection across navigation, and resets for another account", () => {
    const view = render(tree("owner"));
    expect(screen.getByRole("status")).toHaveTextContent(monthKeyFromDate(new Date()));
    fireEvent.click(screen.getByText("choose December"));
    fireEvent.click(screen.getByText("details"));
    expect(screen.getByRole("status")).toHaveTextContent("2025-12");
    view.rerender(tree("other"));
    expect(screen.getByRole("status")).toHaveTextContent(monthKeyFromDate(new Date()));
});
test("legacy UI defaults off and survives navigation, remounts, and account changes", () => {
    const view = render(tree("owner"));
    expect(screen.getByRole("switch", { name: "Legacy UI" })).not.toBeChecked();
    fireEvent.click(screen.getByRole("switch", { name: "Legacy UI" }));
    fireEvent.click(screen.getByText("details"));
    expect(screen.getByRole("switch", { name: "Legacy UI" })).toBeChecked();
    view.rerender(tree("other"));
    expect(screen.getByRole("switch", { name: "Legacy UI" })).toBeChecked();
    view.unmount();
    render(tree("owner"));
    expect(screen.getByRole("switch", { name: "Legacy UI" })).toBeChecked();
    fireEvent.click(screen.getByRole("switch", { name: "Legacy UI" }));
    expect(localStorage.getItem("morfi-splitter:legacy-ui")).toBe("false");
});
test("legacy UI remains usable when browser storage is unavailable", () => {
    const read = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage disabled");
    });
    const write = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage disabled");
    });
    try {
        render(tree("owner"));
        fireEvent.click(screen.getByRole("switch", { name: "Legacy UI" }));
        expect(screen.getByRole("switch", { name: "Legacy UI" })).toBeChecked();
    } finally {
        read.mockRestore();
        write.mockRestore();
    }
});
