import React, { createContext, useState, useContext } from 'react';
import { db } from "../components/firebase/firestore";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { AuthContext } from '../Context/AuthContext';

export const FireContext = createContext();

export default function FireProvider({children}){

    const { cUser } = useContext(AuthContext);

    const [dataArr, setDataArr] = useState([]);
    const [cValue, setCValue] = useState("");
    const [filteredArr, setFilteredArr] = useState([]);
    const [names, setNames] = useState([]);

    const fetchNames = async () => {
        setNames([]);
        const snap = await getDoc(doc(db, "users", "5HTW19fMwDbfc5Gj1ufjMKC3kXu1"))
        setNames(snap.data().names);
    };

    const updateCValue = (date) => {
        let acc = 0;
        dataArr.forEach((i) => {
            if (isThisMonth(i, date)) {
                acc += Number(i.amount)
            }
        });
        setCValue(acc.toFixed(2))
    };

    const filterDataArr = (date) => {
        setFilteredArr([]);
        let provisionalFilteredArr = [];
        dataArr.forEach((i) => {
            if (isThisMonth(i, date)) {
                provisionalFilteredArr.push(i)
            };
        provisionalFilteredArr.sort((a, b) => {
            return a.date - b.date
        });
        setFilteredArr(provisionalFilteredArr);
        })
    };

    const fetchExp = async() => {
        setDataArr([]);
        const q = query(collection(db,"monthly-expenses"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {setDataArr(dataArr => [...dataArr, doc.data()])});
    };

    const isThisMonth = (i, date) => {
        const today = new Date(0);
        today.setUTCSeconds(date);
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();

        const expDate = new Date(0);
        expDate.setUTCSeconds(i.date.seconds);
        const expMonth = expDate.getMonth();
        const expYear = expDate.getFullYear();

        if (thisMonth === expMonth && thisYear === expYear) {
            return true;
        }
    }; 

    return (
        <FireContext.Provider value={{dataArr, cValue, filteredArr, updateCValue, fetchExp, isThisMonth, filterDataArr, fetchNames}}>
            {children}
        </FireContext.Provider>
    )
}