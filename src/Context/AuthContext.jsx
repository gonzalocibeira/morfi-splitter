import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, firebaseConfigurationError } from "../components/firebase/firestore";

export const AuthContext = createContext(null);

function readableAuthError(error) {
    if (error?.code === "auth/invalid-credential" || error?.code === "auth/wrong-password") {
        return "The email or password is incorrect.";
    }

    return error?.message || "Authentication failed. Please try again.";
}

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState(firebaseConfigurationError);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setIsAuthReady(true);
            },
            (authError) => {
                setError(readableAuthError(authError));
                setIsAuthReady(true);
            }
        );

        return unsubscribe;
    }, []);

    const login = useCallback(async (email, password) => {
        if (firebaseConfigurationError) {
            setError(firebaseConfigurationError);
            throw new Error(firebaseConfigurationError);
        }

        setIsAuthenticating(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (loginError) {
            const message = readableAuthError(loginError);
            setError(message);
            throw new Error(message);
        } finally {
            setIsAuthenticating(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsAuthenticating(true);
        setError(null);
        try {
            await signOut(auth);
        } catch (logoutError) {
            const message = readableAuthError(logoutError);
            setError(message);
            throw new Error(message);
        } finally {
            setIsAuthenticating(false);
        }
    }, []);

    const value = useMemo(() => ({
        user,
        isAuthReady,
        isAuthenticating,
        error,
        login,
        logout
    }), [error, isAuthReady, isAuthenticating, login, logout, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
