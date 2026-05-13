import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import History from './pages/History';
import Search from './pages/Search';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:type/:id" element={<MovieDetails />} />
            <Route path="/history" element={<History />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>
        <footer className="footer glass">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Pirate Stream. All rights reserved.</p>
            <p className="footer-sub">Powered by TMDB & Vidfast.pro</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
