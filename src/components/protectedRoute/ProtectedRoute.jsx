import React, { useContext } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from '../../Context/AuthContext';

const ProtectedRoute = ({children}) =>{

    const { cUser } = useContext(AuthContext);

    if (!cUser) {
        return <Navigate to="/" />
    }

    return children
};

export default ProtectedRoute;