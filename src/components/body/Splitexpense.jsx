import React, { useState, useEffect, useContext } from 'react';
import { FireContext } from "../../Context/FireContext";
import MonthPicker from "react-simple-month-picker";



export default function Splitexpense() {

    const {dataArr, cValue, updateCValue, fetchData, isThisMonth, names} = useContext(FireContext);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [u1Value, setU1Value] = useState(0);
    const [u2Value, setU2Value] = useState(0);
    const [u1NoSplit, setU1NoSplit] = useState(0);
    const [u2NoSplit, setU2NoSplit] = useState(0);
    const [debtMsg, setDebtMsg] = useState("");
    const [classSwitch, setClassSwitch] = useState("");

    const updatePValue = (name, date) => {
        let acc = 0;
        let acc2 = 0;

        const onlySplittableDataArr = dataArr.filter(obj => !obj.hasOwnProperty("nonSplit") || obj.nonSplit === false);
        onlySplittableDataArr.forEach((i) => {
            if (isThisMonth(i, date) && i.name === name) {
                acc += Number(i.amount)
            }
        });

        const onlyNonSplittableDataArr = dataArr.filter(obj => obj.nonSplit === true);
        onlyNonSplittableDataArr.forEach((i) => {
            if (isThisMonth(i, date) && i.name === name) {
                acc2 += Number(i.amount)
            }
        })

        if (name === names[0]){
            setU1Value(Number(acc.toFixed(2)));
            setU1NoSplit(Number(acc2.toFixed(2)))
        } else {
            setU2Value(Number(acc.toFixed(2)));
            setU2NoSplit(Number(acc2.toFixed(2)))    
        };
    };

    const debtCalc = () => {
        const substractSplitOnly = u1Value - u2Value;

        const owedPartial = Number((substractSplitOnly/2).toFixed(2)) + u1NoSplit - u2NoSplit;
        const owed = Number(Math.abs(owedPartial))

        if (owedPartial === 0) {setDebtMsg("No one owes the other "); setClassSwitch("no")};
        if (owedPartial > 0) {let msg = `${names[1]} owes ${names[0]} ${owed}€`; setDebtMsg(msg); setClassSwitch("t")};
        if (owedPartial < 0) {let msg = `${names[0]} owes ${names[1]} ${owed} €`; setDebtMsg(msg); setClassSwitch("n")};
    };

    useEffect(() => {
        fetchData()
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
                    <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", width:"90%"}}>
                        <h4>Shared expenses</h4>
                        <div style={{display:"flex", justifyContent:"space-around", width:"100%"}}>
                            <p>{names[0]} spent: {u1Value}€</p>
                            <p>{names[1]} spent: {u2Value}€</p>
                        </div>
                    </div>
                    <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", width:"90%", marginTop:15, }}>
                        <h4>Purchases made on behalf of the other</h4>
                        <div style={{display:"flex", justifyContent:"space-around", width:"100%"}}>
                            <p>{names[0]} spent: {u1NoSplit}€</p>
                            <p>{names[1]} spent: {u2NoSplit}€</p>
                        </div>
                    </div>
                </div>
                <div className="splitFlow">
                    <span className={`${classSwitch === "t"? "activeArrow" : "inactiveArrow"}`}>←</span><span className={`${classSwitch === "no"? "activeArrow" : "inactiveArrow"}`}>-</span><span className={`${classSwitch === "n"? "activeArrow" : "inactiveArrow"}`}>→</span>
                    <p>{debtMsg}</p>
                </div>
            </div>
        </>
    )
}
