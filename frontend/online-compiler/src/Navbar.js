import React from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

const Navbar = (props) => {
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <span className={`navbar-brand mb-0 h1 fs-3 p-3 ${props.isDarkMode ? 'text-light' : 'text-dark'}`} style={{ fontFamily: "Roboto" }}>
                    Online Java Compiler
                </span>
                <div className="d-flex pe-5 pt-1">
                    <DarkModeSwitch
                        checked={props.isDarkMode}
                        onChange={props.toggleDarkMode}
                        size={35}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
