import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Film, History, Home, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
      setSearch('');
      setIsOpen(false);
    }
  };

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <Link to="/" className="brand">
          <Film className="brand-icon" />
          <span className="gradient-text">Pirate Stream</span>
        </Link>

        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsOpen(false)} className="nav-item">
            <Home size={18} />
            Home
          </Link>
          <Link to="/history" onClick={() => setIsOpen(false)} className="nav-item">
            <History size={18} />
            History
          </Link>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper glass-card">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
