import React, { useContext, useState } from 'react';
import { Supermarket, Food, Utilities, Other } from '../../assets/icons';
import { FireContext } from "../../Context/FireContext";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


export default function Detailedview({name, amount, date, note, category, nonSplit, docId}) {

    const { names, deleteEntry, updateEntry } = useContext(FireContext);
    const delSwal = withReactContent(Swal);

    const expDate = new Date(0);
    expDate.setUTCSeconds(date);
    const dd = expDate.getDate();
    const mm = expDate.getMonth() + 1;
    const yy = expDate.getFullYear();
    const formatedDate = dd + "/" + mm + "/" + yy;

    const [optionsView, setOptionsView] = useState();
    const [editMode, setEditMode] = useState(false);
    const [newAmount, setNewAmount] = useState(amount);

    const confirmDelete = () => {
        delSwal.fire({
            title: <strong>Are you sure?</strong>,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f44336',
            cancelButtonColor: '#B0BEC5',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            width: '90vw'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteEntry(docId);
            }
        });
    };

    let optionsIcon = "▼";
    let expenseIcon = "";
    
    optionsView === true ? optionsIcon = "▲" : optionsIcon = "▼"

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
                <p>{newAmount}€ on {category ? category : "Supermarket"}</p>
                <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
                    {note ? <p style={{marginTop:"-5px", textAlign:"center"}}>Note: {note}</p> : ""}
                    {nonSplit === true ? <p style={{marginTop:"-5px", textAlign:"center", color:"RGB(70,61,134)", backgroundColor:"white", width:"90%", fontWeight:700, borderRadius:"4px"}}>Purchase made for the other user</p> : ""}
                </div>
                <div>
                    <button style={{backgroundColor:"#e9ecef", border:"none", color:"black", borderRadius:"4px", minWidth:"40px"}} onClick={()=>{optionsView === false ? setOptionsView(true) : setOptionsView(false)}}>{optionsIcon}</button>
                </div>
                {optionsView && (
                    <>
                        <button style={{backgroundColor:"var(--primary-color)", border:"none", color:"white", marginTop:"20px", marginBottom:"5px", borderRadius:"4px", marginRight:"5px"}} onClick={()=>setEditMode(!editMode)}>Edit amount</button>
                        <button style={{backgroundColor:"var(--danger-color)", border:"none", color:"white", marginTop:"20px", marginBottom:"5px", borderRadius:"4px"}} onClick={confirmDelete}>Delete entry</button>
                    </>
                )}
                {editMode && (
                    <div style={{display:"flex", alignItems:"center", marginTop:"10px"}}>
                        <input type="number" value={newAmount} onChange={(e)=>setNewAmount(e.target.value)} style={{width:"60px", marginRight:"5px"}} />
                        <button style={{backgroundColor:"var(--primary-color)", border:"none", color:"white", borderRadius:"4px"}} onClick={()=>{updateEntry(docId, newAmount); setEditMode(false); setOptionsView(false);}}>Save</button>
                    </div>
                )}
            </div>
        </div>
    )
}
