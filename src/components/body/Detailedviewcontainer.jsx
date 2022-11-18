import React, { useState, useEffect, useContext } from 'react';
import Detailedview from "./Detailedview";
import { FireContext } from "../../Context/FireContext";
import MonthPicker from 'react-simple-month-picker';

export default function Detailedviewcontainer() {

    const {dataArr, fetchExp, filterDataArr, filteredArr} = useContext(FireContext);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [currentDate, setCurrentDate] = useState("");

    const parseDate = (date) => {
        const expDate = new Date(0);
        expDate.setUTCSeconds(date);
        const dd = expDate.getDate();
        const mm = expDate.getMonth() + 1;
        const yy = expDate.getFullYear();
        setCurrentDate(mm + "/" + yy);
    };

    useEffect(() => {
        fetchExp()
    }, []);

    useEffect(() => {
        filterDataArr(selectedMonth);
        parseDate(selectedMonth);
    }, [dataArr, selectedMonth]);

    return (
        <>
            <div className="splitDate">
                <h2>Select date</h2>
                <MonthPicker onChange={(date)=>setSelectedMonth(date/1000)}/>
            </div>
            <div style={{display:"flex", alignItems:"center", justifyContent:"center", marginTop:10, }}>
                {currentDate === "1/1970" ? "" : <h2>↓ Expenses for {currentDate} ↓</h2>}
            </div>
            <div style={{marginTop:10, marginBottom:20}}>
                {filteredArr.map((el) => {return <Detailedview key={Math.floor(Math.random()*100000)} name={el.name} amount={el.amount} date={el.date.seconds} note={el.note} category={el.category}/>})}
            </div>
        </>
    )
}
