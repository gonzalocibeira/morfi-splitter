import React, { useEffect, useContext } from 'react';
import { FireContext } from "../../Context/FireContext";
import { AuthContext } from '../../Context/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';

export default function Landing() {

    const {dataArr, cValue, updateCValue, fetchData} = useContext(FireContext);
    const {auth, setUsrEmail, setUsrPassword, cUser, setCUser, login, logout} = useContext(AuthContext);

    const today = new Date().getTime()/1000;

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {setCUser(currentUser)});
    }, []);

    useEffect(() => {
        fetchData();
    }, [cUser]);

    useEffect(() => {
        updateCValue(today)
    }, [dataArr]);

    return (
        <>
            {cUser ? 
            <div style={{display:"flex", flexDirection:"column", justifyContent:"space-between", height:"500px"}}>
                <div style={flexCenter}>
                    <h2 style={{fontSize:"25px"}}>
                        The total spent this month is:
                    </h2>
                    <h2 style={{fontSize:"50px", borderBottom:"1.5px solid white", margin:"0"}}>
                        {cValue}€
                    </h2>
                </div>
                <div style={flexCenter}>
                    <p>Logged in as <strong>{cUser.email}</strong></p>
                    <button className="btnClear" onClick={logout}>Logout</button>
                </div>
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

// Styles
const flexCenter = {
    display:"flex",
    flexDirection:"column",
    alignItems:"center"
}