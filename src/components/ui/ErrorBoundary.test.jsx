import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ErrorBoundary from "./ErrorBoundary";
test("unexpected rendering failures leave a recovery action", () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    function Broken() {
        throw new Error("render failure");
    }
    render(
        <ErrorBoundary>
            <Broken />
        </ErrorBoundary>,
    );
    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload app" })).toBeInTheDocument();
    log.mockRestore();
});
