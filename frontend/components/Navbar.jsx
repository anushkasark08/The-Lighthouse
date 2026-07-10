import React from 'react';

const Navbar = ({ theme, toggleTheme }) => {
  return (
    <nav className="navbar">
      <div className="logo">The Lighthouse</div>
      <ul className="nav-links">
        <li><a href="#hero">Home</a></li>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#reservation">Reservation</a></li>
      </ul>
      <button id="themeToggle" onClick={toggleTheme}>
        {theme === 'light' ? '☀️' : '🌙'}
      </button>
    </nav>
  );
};

export default Navbar;
