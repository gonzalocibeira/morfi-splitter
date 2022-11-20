import React, { useState } from 'react';
import { db } from "../firebase/firestore";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'

export default function Newexpense() {

    const valSwal = withReactContent(Swal);

    const [usrName, setUsrName] = useState("");
    const [usrExp, setUsrExp] = useState("");
    const [usrCategory, setUsrCategory] = useState("Supermarket");
    const [usrNote, setUsrNote] = useState("");

    const addExpense = () => {

        if (validation()){
            const expCollection = collection(db,"monthly-expenses");
            addDoc(expCollection, {
                name:usrName,
                amount:usrExp,
                date:serverTimestamp(),
                note:usrNote,
                category:usrCategory
            })
            .then(
                valSwal.fire({
                    title: <strong>Expense added!</strong>,
                    icon: 'success'
                }),
                clear()
            )
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
                                    <option value="Nadi">Nadi</option>
                                    <option value="Turco">Turco</option>
                                </select>
                            </label>
                            <label>&nbsp;spent&nbsp;
                                <input style={{width:50}} type="number" value={usrExp} onChange={(e) => setUsrExp(e.target.value)} />
                            </label>
                            <label>€ on&nbsp;
                                <select value={usrCategory} onChange={(e) => setUsrCategory(e.target.value)}>
                                    <option value="Supermarket">Supermarket</option>
                                    <option value="Food">Food</option>
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
                    <button onClick={()=>clear()} className="btnClear">Clear expense</button>
                    <button onClick={()=>addExpense()} className="btnSubmit">Submit expense</button>
                </div>
            </div>
        </>
    )
}