import React from 'react'

export default function Detailedview({name, amount, date, note, category}) {

    const expDate = new Date(0);
    expDate.setUTCSeconds(date);
    const dd = expDate.getDate();
    const mm = expDate.getMonth() + 1;
    const yy = expDate.getFullYear();
    const formatedDate = dd + "/" + mm + "/" + yy

    return (
        <div className="detailedExpense">
            <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                <p>{name} spent {amount}€ on the {formatedDate}</p>
                <p style={{marginTop:"-5px"}}>Note: {note}, Category: {category}</p>
            </div>
        </div>
    )
}
