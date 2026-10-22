import React from "react";
import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
const items = [
    { name: "Overview", route: "/", icon: "home" },
    { name: "Add expense", route: "/new", icon: "plus" },
    { name: "Split", route: "/split", icon: "split" },
    { name: "Details", route: "/detail", icon: "chart" },
    { name: "Settings", route: "/settings", icon: "settings" },
];
export default function Nav() {
    return (
        <nav className="main-nav" aria-label="Main navigation">
            {items.map((item) => (
                <NavLink
                    key={item.route}
                    to={item.route}
                    end
                    className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`}
                >
                    <Icon name={item.icon} />
                    <span>{item.name}</span>
                </NavLink>
            ))}
        </nav>
    );
}
