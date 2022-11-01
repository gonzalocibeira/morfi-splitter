import React from 'react';
import "./navbar.css";
import { Link } from "react-router-dom";
import expenses from "../../assets/expenses.png";
import Nav from "./Nav"

export default function Navbar() {

    const categories = [
        {id:0, name:"Add expense", route:"/new"},
        {id:1, name:"Split expenses", route:"/split"}
    ]


    return (
        <header>
            <Link to={"/"} style={{ textDecoration: 'none' }}>
                <div className="headerDiv">
                    <img src={expenses} className="headerIcon" alt="logo"/>
                    <h1 className="headerH1">Morfi Splitter</h1>
                </div>
            </Link>
            <Nav categories={categories}/>
        </header>
    )
}
