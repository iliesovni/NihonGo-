import React from 'react';
import Logo from './Logo';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Logo />
        </div>
        <nav className="navbar-right">
          <ul>
            <li><a href="#/home">Accueil</a></li>
            <li><a href="#/search">Recherche</a></li>
            <li><a href="#/favorites">Favoris</a></li>
            <li><a href="#/contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
