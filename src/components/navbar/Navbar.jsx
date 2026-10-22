import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import Nav from "./Nav";
import "./navbar.css";
export default function Navbar() {
    const { user } = useContext(AuthContext);
    return (
        <header className="app-header">
            <div className="header-inner">
                <Link to="/" className="brand" aria-label="Morfi Splitter home">
                    <img className="brand-mark" src="/brand-mark.svg" alt="" width="42" height="42" />
                    <span className="brand-wordmark">
                        morfi<span className="brand-light"> splitter</span>
                    </span>
                </Link>
                {user && <Nav />}
            </div>
        </header>
    );
}
