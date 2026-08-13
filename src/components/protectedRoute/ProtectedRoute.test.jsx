import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function renderRoute(authValue) {
    render(
        <AuthContext.Provider value={authValue}>
            <MemoryRouter initialEntries={["/private"]}>
                <Routes>
                    <Route path="/" element={<p>Landing</p>} />
                    <Route path="/private" element={<ProtectedRoute><p>Private</p></ProtectedRoute>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
}

test("waits for session restoration before redirecting", () => {
    renderRoute({ user: null, isAuthReady: false });
    expect(screen.getByText("Restoring your session…")).toBeInTheDocument();
    expect(screen.queryByText("Landing")).not.toBeInTheDocument();
});

test("redirects only after an anonymous session is known", () => {
    renderRoute({ user: null, isAuthReady: true });
    expect(screen.getByText("Landing")).toBeInTheDocument();
});

test("renders protected content for an authenticated user", () => {
    renderRoute({ user: { uid: "owner" }, isAuthReady: true });
    expect(screen.getByText("Private")).toBeInTheDocument();
});
