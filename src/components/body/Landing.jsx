import React, { useState, useEffect, useContext } from 'react';
import { FireContext } from "../../Context/FireContext";

export default function Landing() {

    const {dataArr, cValue, updateCValue, fetchExp} = useContext(FireContext);

    const today = new Date().getTime()/1000;

    useEffect(() => {
        fetchExp()
    }, []);

    useEffect(() => {
        updateCValue(today)
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