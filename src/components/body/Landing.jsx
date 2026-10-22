import React, { useContext, useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { FireContext } from "../../Context/FireContext";
import { AuthContext } from "../../Context/AuthContext";
import { monthKeyFromDate, formatMonthKey } from "../../domain/months";
import { formatCents } from "../../domain/money";
import useMonth from "../../hooks/useMonth";
import Icon from "../ui/Icon";
import { Button, Card, Loading, MonthStatus, Notice, PageTitle } from "../ui/Primitives";
const shortcuts = [
    {
        to: "/new",
        icon: "plus",
        title: "Add expense",
        text: "Record a payment.",
        color: "sage",
    },
    {
        to: "/split",
        icon: "split",
        title: "Split expenses",
        text: "See who owes whom.",
        color: "peach",
    },
    {
        to: "/detail",
        icon: "chart",
        title: "Expense details",
        text: "View charts and edit expenses.",
        color: "lavender",
    },
];
export default function Landing() {
    const { user, isAuthReady, isAuthenticating, error, configurationError, login, logout } =
        useContext(AuthContext);
    const { profileError } = useContext(FireContext);
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [logoutError, setLogoutError] = useState(null);
    const monthKey = monthKeyFromDate(new Date());
    const month = useMonth(user ? monthKey : null);
    const total = useMemo(
        () => month.expenses.reduce((sum, expense) => sum + expense.amountCents, 0),
        [month.expenses],
    );
    if (!isAuthReady) return <Loading>Restoring your session…</Loading>;
    if (user && ["/new", "/split", "/detail"].includes(location.state?.from))
        return <Navigate to={location.state.from} replace />;
    const handleLogin = async (event) => {
        event.preventDefault();
        if (isAuthenticating) return;
        try {
            await login(email, password);
            setPassword("");
        } catch {
            /* Provider owns the error. */
        }
    };
    if (!user)
        return (
            <div className="login-layout">
                <section className="login-intro">
                    <span className="category-icon category-icon--sage">
                        <Icon name="wallet" size={30} />
                    </span>
                    <h2>Split household expenses</h2>
                    <p>Record what each person paid and calculate the balance for the month.</p>
                </section>
                <Card className="login-card">
                    <h1>Login</h1>
                    <p className="muted">Access your household expenses.</p>
                    <form onSubmit={handleLogin} className="stack-form">
                        <label className="field">
                            Email
                            <input
                                type="email"
                                autoComplete="email"
                                value={email}
                                placeholder="you@example.com"
                                required
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </label>
                        <label className="field">
                            Password
                            <input
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                placeholder="Your password"
                                required
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </label>
                        {error && <Notice>{error}</Notice>}
                        <Button
                            type="submit"
                            disabled={isAuthenticating || Boolean(configurationError)}
                        >
                            {isAuthenticating ? "Logging in…" : "Login"}
                            <Icon name="arrow" size={18} />
                        </Button>
                    </form>
                    <p className="login-note">Accounts are created by request.</p>
                </Card>
            </div>
        );
    return (
        <>
            <PageTitle title="Overview" icon="home" />
            <div className="overview-grid">
                <Card className="total-card">
                    <div className="section-topline">
                        <p className="month-caption">{formatMonthKey(monthKey)}</p>
                        <Icon name="calendar" />
                    </div>
                    <p className="total-label">Total expenses</p>
                    {month.status === "success" ? (
                        <p className="hero-amount">{formatCents(total)}</p>
                    ) : (
                        <div className="amount-skeleton" aria-hidden="true" />
                    )}
                    <MonthStatus month={month} monthKey={monthKey} />
                    {month.status === "success" && (
                        <p className="total-footnote">
                            {month.expenses.length === 0
                                ? "No expenses this month."
                                : `${month.expenses.length} ${month.expenses.length === 1 ? "expense" : "expenses"}`}
                        </p>
                    )}
                </Card>
                <div className="shortcut-list">
                    {shortcuts.map((item) => (
                        <Link key={item.to} to={item.to} className="shortcut card">
                            <span className={`category-icon category-icon--${item.color}`}>
                                <Icon name={item.icon} />
                            </span>
                            <span>
                                <strong>{item.title}</strong>
                                <small>{item.text}</small>
                            </span>
                            <Icon name="chevron" size={18} />
                        </Link>
                    ))}
                </div>
            </div>
            {profileError && <Notice>{profileError}</Notice>}
            <Card className="account-card">
                <div>
                    <p className="eyebrow">YOUR ACCOUNT</p>
                    <p className="account-email">{user.email}</p>
                </div>
                <Button
                    variant="secondary"
                    disabled={isAuthenticating}
                    onClick={async () => {
                        setLogoutError(null);
                        try {
                            await logout();
                        } catch (failure) {
                            setLogoutError(failure.message);
                        }
                    }}
                >
                    <Icon name="logout" size={18} />
                    {isAuthenticating ? "Logging out…" : "Logout"}
                </Button>
                {logoutError && <Notice>{logoutError}</Notice>}
            </Card>
        </>
    );
}
