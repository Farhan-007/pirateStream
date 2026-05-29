import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Watch from './pages/Watch';
import History from './pages/History';
import Search from './pages/Search';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="app">
      {!isLandingPage && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/:type/:id" element={<MovieDetails />} />
          <Route path="/watch/:type/:id" element={<Watch />} />
          <Route path="/history" element={<History />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
      {!isLandingPage && (
        <footer className="footer glass">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Pirate Stream. All rights reserved.</p>
            <p className="footer-sub">Powered by TMDB & Vidfast.pro</p>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

