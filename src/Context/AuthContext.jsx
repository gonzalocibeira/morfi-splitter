import React, { createContext, useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from "../components/firebase/firestore";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'

const authSwal = withReactContent(Swal);

export const AuthContext = createContext();

export default function AuthProvider({children}){

    const [usrEmail, setUsrEmail] = useState("");
    const [usrPassword, setUsrPassword] = useState("");
    const [cUser, setCUser] = useState({});

    const login = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, usrEmail, usrPassword);
            authSwal.fire({
                title: <strong>Welcome back {usrEmail}!</strong>,
                icon: 'success'
            })
        } catch (err) {
            authSwal.fire({
                title: <strong>Wrong user or password.</strong>,
                icon: 'error'
            })
        }
    };

    const logout = async () => {
        await signOut(auth);
        authSwal.fire({
            title: <strong>Logged out successfully.</strong>,
            icon: 'info'
        })
    };

    return (
        <AuthContext.Provider value={{auth, usrEmail, setUsrEmail, usrPassword, setUsrPassword, cUser, setCUser, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
