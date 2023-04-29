import React, { useContext } from 'react';
import { Supermarket, Food, Utilities, Other } from '../../assets/icons';
import { FireContext } from "../../Context/FireContext";


export default function Detailedview({name, amount, date, note, category, nonSplit}) {

    const { names } = useContext(FireContext);

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
        <div className="detailedExpense" data-aos={name === names[0] ? "fade-right" : "fade-left"} style={name === names[1] ? {marginLeft:"auto"} : {marginLeft:10}}>
            <img className="expenseIcon" src={expenseIcon} alt="" />
            <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                <p style={{borderBottom:"1px solid white", marginBottom:-5}}>{formatedDate} - <strong>{name}</strong></p>
                <p>{amount}€ on {category ? category : "Supermarket"}</p>
                <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
                    {note ? <p style={{marginTop:"-5px", textAlign:"center"}}>Note: {note}</p> : ""}
                    {nonSplit === true ? <p style={{marginTop:"-5px", textAlign:"center", color:"RGB(70,61,134)", backgroundColor:"white", width:"90%", fontWeight:700}}>Purchase made for the other user</p> : ""}
                </div>
            </div>
        </div>
    )
}
