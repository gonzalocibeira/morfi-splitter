import React, { useEffect, useContext } from 'react';
import { FireContext } from "../../Context/FireContext";
import { AuthContext } from '../../Context/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';

export default function Landing() {

    const {dataArr, cValue, updateCValue, fetchExp} = useContext(FireContext);
    const {auth, setUsrEmail, setUsrPassword, cUser, setCUser, login, logout} = useContext(AuthContext);

    const today = new Date().getTime()/1000;

    useEffect(() => {
        fetchExp();
        onAuthStateChanged(auth, (currentUser) => {setCUser(currentUser)})
    }, []);

    useEffect(() => {
        updateCValue(today)
    }, [dataArr]);

    return (
        <>
            {cUser ? 
            <div style={styles}>
                <h2 style={{fontSize:"25px"}}>
                    The total spent this month is:
                </h2>
                <h2 style={{fontSize:"50px"}}>
                    {cValue}€
                </h2>
                <p>Logged in as <strong>{cUser.email}</strong></p>
                <button className="btnClear" onClick={logout}>Logout</button>
            </div> : 
            <div>
                <p className="loginMsg">Please login to use Morfi Splitter</p>
                <div className="login">
                    <input type="email" placeholder="email" onChange={(e) => setUsrEmail(e.target.value)}/>
                    <input type="password" placeholder="password" onChange={(e) => setUsrPassword(e.target.value)}/>
                    <button className="btnSubmit" onClick={login}>Login</button>
                </div>
            </div>
            }
        </>
    )
}

const styles = {
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center"
}