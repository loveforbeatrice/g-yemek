import React from "react";
import "../styles/navbar.css";

const Navbar = () => {
  return (
    <div className="navbar-container">
      <div className="navbar">
        <div className="navbar-left">
          <img src="/src/assets/yemek-logo.png" alt="yemek" className="logo" />
        </div>
        <div className="navbar-right">
          <span className="contact-text">CONTACT</span>
          <span className="globe-icon">🌐</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
