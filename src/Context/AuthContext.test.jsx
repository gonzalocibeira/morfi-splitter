import React, { useContext } from "react";
import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { onAuthStateChanged } from "firebase/auth";
import AuthProvider, { AuthContext } from "./AuthContext";

jest.mock("firebase/auth", () => ({
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn()
}));

jest.mock("../components/firebase/firestore", () => ({
    auth: {},
    firebaseConfigurationError: null
}));

function Consumer() {
    const { user, isAuthReady } = useContext(AuthContext);
    return <p>{isAuthReady ? user?.email || "anonymous" : "loading"}</p>;
}

test("restores the auth session and unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    let handleUser;
    onAuthStateChanged.mockImplementation((auth, onUser) => {
        handleUser = onUser;
        return unsubscribe;
    });

    const view = render(<AuthProvider><Consumer /></AuthProvider>);
    expect(screen.getByText("loading")).toBeInTheDocument();

    act(() => handleUser({ uid: "owner", email: "owner@example.com" }));
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();

    view.unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
});
