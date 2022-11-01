import React, { useState, useEffect } from 'react';
import { db } from "../firebase/firestore";
import { collection, getDocs, query } from "firebase/firestore";

export default function Landing() {


    const [dataArr, setDataArr] = useState([]);
    const [cValue, setCValue] = useState("");

    const fetchExp = async() => {
        const q = query(collection(db,"monthly-expenses"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {setDataArr(dataArr => [...dataArr, doc.data()])});
        return new Promise (function (resolve) {
            resolve(true)
        })
    }

    const updateCValue = () => {
        let acc = 0;
        dataArr.forEach((i) => {acc += Number(i.amount)})
        setCValue(acc)
    };

    useEffect(() => {
        fetchExp()
    }, []);

    useEffect(() => {
        updateCValue()
    }, [dataArr]);

    return (
        <>
            <div style={styles}>
                <h2 style={{fontSize:"25px"}}>
                    The total spent this month is:
                </h2>
                <h2 style={{fontSize:"50px"}}>
                    {cValue}€
                </h2>
                <button onClick={()=>console.log(updateCValue())}>ggg</button>
            </div>
        </>
    )
}

const styles = {
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center"
}