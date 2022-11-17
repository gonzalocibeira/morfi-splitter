import React, { useState, useEffect, useContext } from 'react';
import Detailedview from "./Detailedview";
import { FireContext } from "../../Context/FireContext";
import MonthPicker from 'react-simple-month-picker';

export default function Detailedviewcontainer() {

    const {dataArr, fetchExp, filterDataArr, filteredArr} = useContext(FireContext);
    const [selectedMonth, setSelectedMonth] = useState("");

    useEffect(() => {
        fetchExp()
    }, []);

    useEffect(() => {
        filterDataArr(selectedMonth);
    }, [dataArr, selectedMonth]);

    return (
        <>
            <div className="splitDate">
                <h2>Select date</h2>
                <MonthPicker onChange={(date)=>setSelectedMonth(date/1000)}/>
            </div>
            <div>
                {filteredArr.map((el) => {return <Detailedview key={Math.floor(Math.random()*100000)} name={el.name} amount={el.amount} date={el.date.seconds} note={el.note} category={el.category}/>})}
            </div>
        </>
    )
}
