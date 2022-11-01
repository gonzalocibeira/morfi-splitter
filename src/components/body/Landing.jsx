import React, { useState, useEffect } from 'react';
import { db } from "../firebase/firestore";
import { collection, getDocs, query } from "firebase/firestore";

export default function Landing() {

    const today = new Date();

    const [dataArr, setDataArr] = useState([]);
    const [cValue, setCValue] = useState("");

    const fetchExp = async() => {
        const q = query(collection(db,"monthly-expenses"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {setDataArr(dataArr => [...dataArr, doc.data()])});
    }

    const updateCValue = () => {
        let acc = 0;
        dataArr.forEach((i) => {
            if (isThisMonth(i)) {
                acc += Number(i.amount)
            }
        })
        setCValue(acc)
    };

    const isThisMonth = (i) => {
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();

        const expDate = new Date(0);
        expDate.setUTCSeconds(i.date.seconds)
        const expMonth = expDate.getMonth();
        const expYear = expDate.getFullYear();

        if (thisMonth === expMonth && thisYear === expYear) {
            return true;
        }
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
                <button onClick={() => {isThisMonth()}}>Holi</button>
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