import React, { useState, useEffect, useContext } from 'react';
import { FireContext } from "../../Context/FireContext";
import MonthPicker from 'react-simple-month-picker';


export default function Splitexpense() {

    const {dataArr, cValue, updateCValue, fetchExp, isThisMonth} = useContext(FireContext);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [nadiValue, setNadiValue] = useState("");
    const [turcoValue, setTurcoValue] = useState("");
    const [debtMsg, setDebtMsg] = useState("");
    const [classSwitch, setClassSwitch] = useState("");

    const updatePValue = (name,date) => {
        let acc = 0;
        dataArr.forEach((i) => {
            if (isThisMonth(i, date) && i.name === name) {
                acc += Number(i.amount)
            }
            if (name === "Nadi"){
                setNadiValue(acc);
            } else (setTurcoValue(acc));
        })
    };

    const debtCalc = () => {
        const substract = nadiValue - turcoValue;
        const owed = Number(Math.abs(substract/2))

        if (substract === 0) {setDebtMsg("No one owes the other"); setClassSwitch("no")};
        if (substract > 0) {let msg = `Turco owes Nadi ${owed}€`; setDebtMsg(msg); setClassSwitch("t")};
        if (substract < 0) {let msg = `Nadi owes Turco ${owed} €`; setDebtMsg(msg); setClassSwitch("n")};
    };

    useEffect(() => {
        fetchExp()
    }, []);

    useEffect(() => {
        updateCValue(selectedMonth);
        updatePValue("Nadi", selectedMonth);
        updatePValue("Turco", selectedMonth);

    }, [dataArr, selectedMonth]);

    useEffect(() => {
        debtCalc()
    }, [nadiValue, turcoValue]);



    return (
        <>
            <div>
                <h2>Select date</h2>
                <MonthPicker onChange={(date)=>setSelectedMonth(date/1000)}/>
            </div>
            <div>
                <p>Selected month total: {cValue}€</p>
            </div>
            <div>
                <p>Nadi: {nadiValue}€</p>
                <p>Turco: {turcoValue}€</p>
            </div>
            <div>
                <span className={`${classSwitch === "t"? "activeArrow" : "inactiveArrow"}`}>←</span><span className={`${classSwitch === "no"? "activeArrow" : "inactiveArrow"}`}>-</span><span className={`${classSwitch === "n"? "activeArrow" : "inactiveArrow"}`}>→</span>
                <p>{debtMsg}</p>
            </div>
        </>
    )
}
