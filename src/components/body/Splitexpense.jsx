import React, { useState, useEffect, useContext } from 'react';
import { FireContext } from "../../Context/FireContext";
import MonthPicker from "react-simple-month-picker";



export default function Splitexpense() {

    const {dataArr, cValue, updateCValue, fetchExp, isThisMonth, names} = useContext(FireContext);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [u1Value, setU1Value] = useState("");
    const [u2Value, setU2Value] = useState("");
    const [debtMsg, setDebtMsg] = useState("");
    const [classSwitch, setClassSwitch] = useState("");

    const updatePValue = (name,date) => {
        let acc = 0;
        dataArr.forEach((i) => {
            if (isThisMonth(i, date) && i.name === name) {
                acc += Number(i.amount)
            }
            if (name === names[0]){
                setU1Value(acc.toFixed(2));
            } else (setU2Value(acc.toFixed(2)));
        })
    };

    const debtCalc = () => {
        const substract = u1Value - u2Value;
        const owed = Number(Math.abs(substract/2).toFixed(2))

        if (substract === 0) {setDebtMsg("No one owes the other"); setClassSwitch("no")};
        if (substract > 0) {let msg = `${names[1]} owes ${names[0]} ${owed}€`; setDebtMsg(msg); setClassSwitch("t")};
        if (substract < 0) {let msg = `${names[0]} owes ${names[1]} ${owed} €`; setDebtMsg(msg); setClassSwitch("n")};
    };

    useEffect(() => {
        fetchExp()
    }, []);

    useEffect(() => {
        updateCValue(selectedMonth);
        updatePValue(names[0], selectedMonth);
        updatePValue(names[1], selectedMonth);

    }, [dataArr, selectedMonth]);

    useEffect(() => {
        debtCalc()
    }, [u1Value, u2Value]);



    return (
        <>
            <div className="splitDate">
                <h2>Select date</h2>
                <MonthPicker onChange={(date)=>setSelectedMonth(date/1000)}/>
            </div>
            <div className="splitCont">
                <div className="splitTotal">
                    <p>Selected month total: {cValue}€</p>
                </div>
                <div className="splitNames">
                    <p>{names[0]} spent: {u1Value}€</p>
                    <p>{names[1]} spent: {u2Value}€</p>
                </div>
                <div className="splitFlow">
                    <span className={`${classSwitch === "t"? "activeArrow" : "inactiveArrow"}`}>←</span><span className={`${classSwitch === "no"? "activeArrow" : "inactiveArrow"}`}>-</span><span className={`${classSwitch === "n"? "activeArrow" : "inactiveArrow"}`}>→</span>
                    <p>{debtMsg}</p>
                </div>
            </div>
        </>
    )
}
