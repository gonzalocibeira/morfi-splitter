import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { UIContext } from "../../Context/UIContext";
import expenses from "../../assets/expenses.png";
import Nav from "./Nav";
import "./navbar.css";
export default function Navbar() {
    const { user } = useContext(AuthContext);
    const { legacyUI } = useContext(UIContext);
    return (
        <header className="app-header">
            <div className="header-inner">
                <Link to="/" className="brand" aria-label="Morfi Splitter home">
                    <img
                        className="brand-mark"
                        src={legacyUI ? expenses : "/brand-mark.svg"}
                        alt=""
                        width="42"
                        height="42"
                    />
                    <span className="brand-wordmark">
                        {legacyUI ? "Morfi Splitter" : (
                            <>morfi<span className="brand-light"> splitter</span></>
                        )}
                    </span>
                </Link>
                {user && <Nav />}
            </div>
        </header>
    );
}
