import React, { useContext, useEffect, useMemo, useState } from "react";
import { FireContext } from "../../Context/FireContext";
import { AuthContext } from "../../Context/AuthContext";
import { monthKeyFromDate } from "../../domain/months";
import { formatCents } from "../../domain/money";

export default function Landing() {
    const { user, isAuthReady, isAuthenticating, error, login, logout } = useContext(AuthContext);
    const { getMonth, loadMonth, profileError } = useContext(FireContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const currentMonthKey = monthKeyFromDate(new Date());
    const currentMonth = getMonth(currentMonthKey);

    useEffect(() => {
        if (user?.uid) {
            loadMonth(currentMonthKey).catch(() => undefined);
        }
    }, [currentMonthKey, loadMonth, user]);

    const totalCents = useMemo(
        () => currentMonth.expenses.reduce((total, expense) => total + expense.amountCents, 0),
        [currentMonth.expenses]
    );

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            await login(email, password);
            setPassword("");
        } catch {
            // The provider exposes the user-facing error.
        }
    };

    if (!isAuthReady) {
        return <p className="statusMsg">Restoring your session…</p>;
    }

    if (user) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "500px" }}>
                <div style={flexCenter}>
                    <h2 style={{ fontSize: "25px" }}>The total spent this month is:</h2>
                    {currentMonth.status === "loading" && <p>Loading expenses…</p>}
                    {currentMonth.status === "error" && (
                        <div className="errorMsg" role="alert">
                            <p>{currentMonth.error}</p>
                            <button onClick={() => loadMonth(currentMonthKey, { force: true }).catch(() => undefined)}>Retry</button>
                        </div>
                    )}
                    {currentMonth.status !== "error" && (
                        <h2 style={{ fontSize: "50px", borderBottom: "1.5px solid white", margin: 0 }}>
                            {formatCents(totalCents)}
                        </h2>
                    )}
                    {profileError && <p className="errorMsg" role="alert">{profileError}</p>}
                </div>
                <div style={flexCenter}>
                    <p>Logged in as <strong>{user.email}</strong></p>
                    <button className="btnClear" disabled={isAuthenticating} onClick={() => logout().catch(() => undefined)}>
                        {isAuthenticating ? "Logging out…" : "Logout"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <p className="loginMsg">Please login to use Morfi Splitter</p>
            <form className="login" onSubmit={handleLogin}>
                <input
                    type="email"
                    value={email}
                    placeholder="email"
                    autoComplete="email"
                    required
                    onChange={(event) => setEmail(event.target.value)}
                />
                <input
                    type="password"
                    value={password}
                    placeholder="password"
                    autoComplete="current-password"
                    required
                    onChange={(event) => setPassword(event.target.value)}
                />
                <button className="btnSubmit" type="submit" disabled={isAuthenticating}>
                    {isAuthenticating ? "Logging in…" : "Login"}
                </button>
            </form>
            {error && <p className="errorMsg" role="alert">{error}</p>}
        </div>
    );
}

const flexCenter = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
};
