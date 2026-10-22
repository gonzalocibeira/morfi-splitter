import React from "react";
import strawHat from "../../assets/nika.png";
export default function Footer() {
    return (
        <footer className="app-footer">
            <img
                className="footer-straw-hat"
                src={strawHat}
                alt="Straw hat"
                width="40"
                height="40"
            />
            <small>Developed by Gonzalo Cibeira · 2022</small>
        </footer>
    );
}
