import React, { createContext, useState } from 'react';
import { db } from "../components/firebase/firestore";
import { collection, getDocs, query } from "firebase/firestore";

export const FireContext = createContext();

export default function FireProvider({children}){

    const [dataArr, setDataArr] = useState([]);
    const [cValue, setCValue] = useState("");
    const [filteredArr, setFilteredArr] = useState([]);

    const updateCValue = (date) => {
        let acc = 0;
        dataArr.forEach((i) => {
            if (isThisMonth(i, date)) {
                acc += Number(i.amount)
            }
        })
        setCValue(acc.toFixed(2))
    };

    const filterDataArr = (date) => {
        setFilteredArr([]);
        let provisionalFilteredArr = [];
        dataArr.forEach((i) => {
            if (isThisMonth(i, date)) {
                provisionalFilteredArr.push(i)
            }
        setFilteredArr(provisionalFilteredArr);
        })
    };

    const fetchExp = async() => {
        setDataArr([])
        const q = query(collection(db,"monthly-expenses"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {setDataArr(dataArr => [...dataArr, doc.data()])});
    };

    const isThisMonth = (i, date) => {
        const today = new Date(0);
        today.setUTCSeconds(date)
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

    return (
        <FireContext.Provider value={{dataArr, cValue, filteredArr, updateCValue, fetchExp, isThisMonth, filterDataArr}}>
            {children}
        </FireContext.Provider>
    )
}