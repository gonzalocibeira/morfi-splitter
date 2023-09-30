import React, { useState, useEffect, useContext } from 'react';
import Detailedview from "./Detailedview";
import { FireContext } from "../../Context/FireContext";
import MonthPicker from 'react-simple-month-picker';
import DailyChart from './charts/DailyChart';
import CategoryChart from './charts/CategoryChart';
import UserChart from './charts/UserChart';
import AOS from 'aos';
import "aos/dist/aos.css";

export default function Detailedviewcontainer() {

    const { dataArr, fetchData, filterDataArr, filteredArr } = useContext(FireContext);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [chartType, setChartType] = useState("daily");

    const parseDate = (date) => {
        const expDate = new Date(0);
        expDate.setUTCSeconds(date);
        const dd = expDate.getDate();
        const mm = expDate.getMonth() + 1;
        const yy = expDate.getFullYear();
        setCurrentDate(mm + "/" + yy);
    };

    useEffect(() => {
        fetchData();
        AOS.init();
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
                {currentDate === "1/1970" ?
                <h2 style={{textAlign:"center"}}>Please select a date</h2> : 
                <div style={{display:"flex", flexDirection:"column", width:"100vw"}}>
                    <h2 style={{textAlign:"center"}}>↓ Expenses for {currentDate} ↓</h2>
                    <h3 style={{borderBottom:"solid 2px black", textAlign:"center"}}>Charts</h3>
                    <div style={{display:"flex", justifyContent:"space-evenly", marginBottom:30}}>
                        <button className="chartBtn" onClick={() => setChartType("daily")}>Day to day</button>
                        <button className="chartBtn" onClick={() => setChartType("category")}>By category</button>
                        <button className="chartBtn" onClick={() => setChartType("user")}>By user</button>
                    </div>
                    {chartType === "daily" && <DailyChart key={1000001} data={filteredArr}/>}
                    {chartType === "category" && <CategoryChart key={1000002} data={filteredArr}/>}
                    {chartType === "user" && <UserChart key={1000003} data={filteredArr}/>}
                    <h3 style={{borderBottom:"solid 2px black", textAlign:"center", marginTop:"40px"}}>List of expenses by date</h3>
                    <div style={{marginTop:10, marginBottom:20, overflow:"hidden"}}>
                        {filteredArr.map((el) => {return <Detailedview key={Math.floor(Math.random()*100000)} name={el.data.name} amount={el.data.amount} date={el.data.date.seconds} note={el.data.note} category={el.data.category} nonSplit={el.data.nonSplit} docId={el.id}/>})}
                    </div>
                </div>
                }
            </div>

        </>
    )
}
