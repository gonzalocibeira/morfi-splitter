import React, { lazy, Suspense, useContext, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import AuthProvider, { AuthContext } from "./Context/AuthContext";
import FireProvider from "./Context/FireContext";
import UIProvider, { UIContext } from "./Context/UIContext";
import "./legacy.css";
import Landing from "./components/body/Landing";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/body/footer";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { Loading } from "./components/ui/Primitives";
const NewExpense = lazy(() => import("./components/body/Newexpense"));
const SplitExpense = lazy(() => import("./components/body/Splitexpense"));
const DetailedView = lazy(() => import("./components/body/Detailedviewcontainer"));
const Settings = lazy(() => import("./components/body/Settings"));
function ProtectedPage({ children }) {
    return (
        <ProtectedRoute>
            <Suspense fallback={<Loading>Loading page…</Loading>}>{children}</Suspense>
        </ProtectedRoute>
    );
}
function Shell() {
    const { user } = useContext(AuthContext);
    const { legacyUI } = useContext(UIContext);
    const { pathname } = useLocation();
    const main = useRef(null);
    const previousPath = useRef(pathname);
    useEffect(() => {
        const titles = {
            "/": "Overview",
            "/new": "Add expense",
            "/split": "Split expenses",
            "/detail": "Expense details",
            "/settings": "Settings",
        };
        document.title = `${titles[pathname] || "Page not found"} · Morfi Splitter`;
        if (previousPath.current !== pathname) {
            main.current?.focus({ preventScroll: true });
            window.scrollTo(0, 0);
            previousPath.current = pathname;
        }
    }, [pathname]);
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return undefined;
        let fullHeight = window.innerHeight;
        let fullWidth = window.innerWidth;
        let frame;
        const resize = () => {
            cancelAnimationFrame(frame);
            const root = document.documentElement;
            const focused = document.activeElement;
            const editing = focused?.matches("input, textarea, select");
            if (fullWidth !== window.innerWidth) {
                fullWidth = window.innerWidth;
                fullHeight = window.innerHeight;
            } else if (!editing && !root.classList.contains("keyboard-open")) {
                fullHeight = window.innerHeight;
            }
            const inset = Math.max(
                0,
                window.innerHeight - viewport.height - (viewport.offsetTop || 0),
            );
            const keyboardOpen =
                window.innerWidth < 768 &&
                editing &&
                (inset > 120 || fullHeight - viewport.height > 120);
            root.classList.toggle("keyboard-open", Boolean(keyboardOpen));
            root.style.setProperty("--keyboard-inset", `${keyboardOpen ? inset : 0}px`);
            if (keyboardOpen) {
                frame = requestAnimationFrame(() => {
                    const actions = document.querySelector(".has-expense-actions .form-actions");
                    const bottom =
                        viewport.height +
                        (viewport.offsetTop || 0) -
                        (actions?.getBoundingClientRect().height || 0) -
                        16;
                    const overflow = focused.getBoundingClientRect().bottom - bottom;
                    if (overflow > 0) window.scrollBy(0, overflow);
                });
            }
        };
        viewport.addEventListener("resize", resize);
        window.addEventListener("resize", resize);
        document.addEventListener("focusin", resize);
        document.addEventListener("focusout", resize);
        return () => {
            cancelAnimationFrame(frame);
            viewport.removeEventListener("resize", resize);
            window.removeEventListener("resize", resize);
            document.removeEventListener("focusin", resize);
            document.removeEventListener("focusout", resize);
            document.documentElement.classList.remove("keyboard-open");
            document.documentElement.style.removeProperty("--keyboard-inset");
        };
    }, []);
    return (
        <FireProvider key={user?.uid || "anonymous"}>
            <div
                className={`app-shell${legacyUI ? " legacy-ui" : ""}${user ? " is-signed-in" : ""}${user && pathname === "/new" ? " has-expense-actions" : ""}`}
            >
                <a className="skip-link" href="#main-content">
                    Skip to content
                </a>
                <Navbar />
                <main id="main-content" className="main-content" ref={main} tabIndex={-1}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route
                            path="/new"
                            element={
                                <ProtectedPage>
                                    <NewExpense />
                                </ProtectedPage>
                            }
                        />
                        <Route
                            path="/split"
                            element={
                                <ProtectedPage>
                                    <SplitExpense />
                                </ProtectedPage>
                            }
                        />
                        <Route
                            path="/detail"
                            element={
                                <ProtectedPage>
                                    <DetailedView />
                                </ProtectedPage>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedPage>
                                    <Settings />
                                </ProtectedPage>
                            }
                        />
                        <Route
                            path="*"
                            element={
                                <section className="card">
                                    <h1>Page not found</h1>
                                    <a href="/">Back to overview</a>
                                </section>
                            }
                        />
                    </Routes>
                </main>
                <Footer />
            </div>
        </FireProvider>
    );
}
export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <UIProvider>
                        <Shell />
                    </UIProvider>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
