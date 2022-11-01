import React from 'react'
import nika from "../../assets/nika.png";

export default function Footer() {
    return (
        <footer>
            <div className="footerDiv">
                <img src={nika} alt="Sraw Hat Icon" className="footerIcon"/>
                <span>Developed by Gonzalo Cibeira - 2022</span>
            </div>
        </footer>
    )
};
