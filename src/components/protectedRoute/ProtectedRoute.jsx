import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { Loading } from "../ui/Primitives";

const ProtectedRoute = ({ children }) => {
    const { user, isAuthReady } = useContext(AuthContext);
    const location = useLocation();

    if (!isAuthReady) {
        return <Loading>Restoring your session…</Loading>;
    }

    if (!user?.uid) {
        return <Navigate to="/" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default ProtectedRoute;
