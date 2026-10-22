import React from "react";
export default class ErrorBoundary extends React.Component {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    render() {
        if (this.state.failed)
            return (
                <main className="fatal-error">
                    <h1>Something went wrong</h1>
                    <p>Reload Morfi Splitter to try again.</p>
                    <button
                        className="button button--primary"
                        onClick={() => window.location.reload()}
                    >
                        Reload app
                    </button>
                </main>
            );
        return this.props.children;
    }
}
