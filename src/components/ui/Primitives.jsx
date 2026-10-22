import React, { useContext } from "react";
import { FireContext } from "../../Context/FireContext";
import Icon from "./Icon";
export function Button({ variant = "primary", className = "", children, ...props }) {
    return (
        <button className={`button button--${variant} ${className}`} {...props}>
            {children}
        </button>
    );
}
export function Card({ className = "", children, ...props }) {
    return (
        <section className={`card ${className}`} {...props}>
            {children}
        </section>
    );
}
export function PageTitle({ title, children, icon }) {
    return (
        <div className="page-heading">
            <div>
                <h1>{title}</h1>
                {children && <p className="page-description">{children}</p>}
            </div>
            {icon && (
                <span className="heading-icon">
                    <Icon name={icon} size={30} />
                </span>
            )}
        </div>
    );
}
export function Notice({ children, variant = "error", ...props }) {
    return (
        <div
            className={`notice notice--${variant}`}
            role={variant === "error" ? "alert" : "status"}
            {...props}
        >
            {children}
        </div>
    );
}
export function Loading({ children = "Loading expenses…" }) {
    return (
        <div className="loading-state" role="status">
            <span className="loading-dot" />
            {children}
        </div>
    );
}
export function MonthStatus({ month, monthKey }) {
    const { loadMonth } = useContext(FireContext);
    if (!monthKey) return <Notice variant="neutral">Choose a month to see your expenses.</Notice>;
    if (month.status === "idle" || month.status === "loading") return <Loading />;
    return (
        <>
            {(month.error || month.warning) && (
                <Notice variant={month.warning ? "warning" : "error"}>
                    <p>{month.warning || month.error}</p>
                    <Button
                        variant="secondary"
                        onClick={() => loadMonth(monthKey, { force: true }).catch(() => undefined)}
                    >
                        Retry refresh
                    </Button>
                </Notice>
            )}
            {month.refreshing && (
                <p className="refreshing" role="status">
                    Updating expenses…
                </p>
            )}
            {month.invalidCount > 0 && (
                <Notice variant="warning">
                    {month.invalidCount} malformed expense record(s) were skipped.
                </Notice>
            )}
        </>
    );
}
export function ProfileGate({ children }) {
    const { participants, profileStatus, profileError } = useContext(FireContext);
    if (profileStatus === "idle" || profileStatus === "loading")
        return <Loading>Loading household profile…</Loading>;
    if (profileError || participants.length !== 2)
        return <Notice>{profileError || "Two participants are required."}</Notice>;
    return children;
}
