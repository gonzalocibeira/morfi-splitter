import React, { useState, useContext } from 'react';
import { db } from "../firebase/firestore";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FireContext } from "../../Context/FireContext";
import { AuthContext } from '../../Context/AuthContext';

export default function Newexpense() {

    const { names } = useContext(FireContext);
    const { cUser }  = useContext(AuthContext);


    const valSwal = withReactContent(Swal);

    const [usrName, setUsrName] = useState("");
    const [usrExp, setUsrExp] = useState("");
    const [usrCategory, setUsrCategory] = useState("Supermarket");
    const [usrNote, setUsrNote] = useState("");

    const addExpense = async () => {

        if (validation()){
            const uid = cUser.uid
            const expCollection = collection(db, "expenses", uid, "monthly")
            await addDoc(expCollection, {
                name:usrName,
                amount:usrExp,
                date:serverTimestamp(),
                note:usrNote,
                category:usrCategory
            });
            valSwal.fire({
                title: <strong>Expense added!</strong>,
                icon: 'success'
            });
            clear()
        } else {
            valSwal.fire({
                title: <strong>Please fill in name & amount</strong>,
                icon: 'error'
            });
        }

    };

    const validation = () => {
        if (usrName !== "" && usrExp > 0){
            return true
        }
    };

    const clear = () => {
        setUsrName("");
        setUsrExp("");
        setUsrCategory("Supermarket");
        setUsrNote("")
    };

    return (
        <>
            <div className="newExpenseTitle">
                <h2>↓ Input new expense ↓</h2>
            </div>
            <div className="newExpenseCont">
                <div className="newExpenseForm">
                    <form className="expenseForm">
                        <div>
                            <label>&nbsp;
                                <select  value={usrName} onChange={(e) => setUsrName(e.target.value)}>
                                    <option value="-">-</option>
                                    <option value={names[0]}>{names[0]}</option>
                                    <option value={names[1]}>{names[1]}</option>
                                </select>
                            </label>
                            <label>&nbsp;spent&nbsp;
                                <input style={{width:50}} type="number" value={usrExp} onChange={(e) => setUsrExp(e.target.value)} />
                            </label>
                            <label>€ on&nbsp;
                                <select value={usrCategory} onChange={(e) => setUsrCategory(e.target.value)}>
                                    <option value="Supermarket">Supermarket</option>
                                    <option value="Food">Food</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                        </div>
                        <div style={{marginTop:15, display:"flex", alignItems:"center", justifyContent:"center"}}>
                            <label>
                                <textarea placeholder="Write a note (optional)" rows={5} cols={42} value={usrNote} onChange={(e) => setUsrNote(e.target.value)}/>
                            </label>
                        </div>
                    </form>
                </div>
                <div className="newExpenseBtns">
                    <button onClick={()=>clear()} className="btnClear">Clear</button>
                    <button onClick={()=>addExpense()} className="btnSubmit">Submit</button>
                </div>
            </div>
        </>
    )
}