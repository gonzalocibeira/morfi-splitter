import React from 'react';
import { Supermarket, Food, Utilities, Other } from '../../assets/icons';


export default function Detailedview({name, amount, date, note, category}) {

    const expDate = new Date(0);
    expDate.setUTCSeconds(date);
    const dd = expDate.getDate();
    const mm = expDate.getMonth() + 1;
    const yy = expDate.getFullYear();
    const formatedDate = dd + "/" + mm + "/" + yy;

    let expenseIcon = "";

    switch (category){
        case "Supermarket":
            expenseIcon = Supermarket;
            break;
        
        case "Food":
            expenseIcon = Food;
            break;

        case "Utilities":
            expenseIcon = Utilities;
            break;

        case "Other":
            expenseIcon = Other;
            break;

        default:
            expenseIcon = Supermarket;
            break;
    };

    return (
        <div className="detailedExpense" data-aos={name === "Nadi" ? "fade-right" : "fade-left"} style={name === "Turco" ? {marginLeft:"auto"} : {marginLeft:10}}>
            <img className="expenseIcon" src={expenseIcon} alt="" />
            <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                <p style={{borderBottom:"1px solid black", marginBottom:-5}}>{formatedDate} - <strong>{name}</strong></p>
                <p>{amount}€ on {category ? category : "Supermarket"}</p>
                {note ? <p style={{marginTop:"-5px"}}>Note: {note}</p> : ""}
            </div>
        </div>
    )
}
