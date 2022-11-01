import React, { useState } from 'react';
import { db } from "../firebase/firestore";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'

export default function Newexpense() {

    const valSwal = withReactContent(Swal);

    const [usrName, setUsrName] = useState("");
    const [usrExp, setUsrExp] = useState("");

    const addExpense = () => {

        if (validation()){
            const expCollection = collection(db,"monthly-expenses");
            addDoc(expCollection, {
                name:usrName,
                amount:usrExp,
                date:serverTimestamp()
            })
            .then(
                valSwal.fire({
                    title: <strong>Expense added!</strong>,
                    icon: 'success'
                })
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
    };

    return (
        <>
            <div className="newExpenseTitle">
                <h2>↓ Input new expense ↓</h2>
            </div>
            <div className="newExpenseForm">
                <form>
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
                    <span>€ on the supermarket.</span>
                </form>
            </div>
            <div className="newExpenseBtns">
                <button onClick={()=>clear()} className="btnClear">Clear expense</button>
                <button onClick={()=>addExpense()} className="btnSubmit">Submit expense</button>
            </div>
        </>
    )
}