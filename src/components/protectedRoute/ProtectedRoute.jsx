import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, isAuthReady } = useContext(AuthContext);

    if (!isAuthReady) {
        return <p className="statusMsg">Restoring your session…</p>;
    }

    if (!user?.uid) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
