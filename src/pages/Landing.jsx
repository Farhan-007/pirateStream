import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Skull, ArrowRight, TrendingUp } from 'lucide-react';
import { fetchTrending, getImageUrl } from '../utils/api';
import './Landing.css';

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [featuredTitle, setFeaturedTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBackdrop = async () => {
      try {
        const trendData = await fetchTrending();
        if (trendData?.results?.length > 0) {
          // Select a random movie/show from top 5 for variety, or the first one
          const item = trendData.results[0];
          setBackdropUrl(getImageUrl(item.backdrop_path, 'original'));
          setFeaturedTitle(item.title || item.name);
        }
      } catch (error) {
        console.error("Error loading landing backdrop", error);
      } finally {
        // Keep the loader showing for at least 1.5 seconds for a premium transition
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };
    loadBackdrop();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className={`landing-container ${loading ? 'is-loading' : ''}`}>
      {/* ── CINEMATIC LOADER ── */}
      {loading && (
        <div className="landing-loader">
          <div className="loader-content">
            <div className="loader-logo">
              <Skull className="loader-skull" size={64} />
            </div>
            <h1 className="loader-brand gradient-text">PIRATE STREAM</h1>
            <div className="loader-track">
              <div className="loader-bar" />
            </div>
            <span className="loader-text">Navigating the seas of cinema...</span>
          </div>
        </div>
      )}

      {/* ── STUNNING BACKDROP ── */}
      <div 
        className="landing-bg"
        style={{ 
          backgroundImage: backdropUrl 
            ? `radial-gradient(circle at center, rgba(10,10,15,0.4) 0%, var(--bg-dark) 85%), url(${backdropUrl})`
            : 'radial-gradient(circle at center, rgba(20,20,35,0.8) 0%, var(--bg-dark) 90%)'
        }}
      />

      {/* ── LANDING MAIN CARD ── */}
      <div className="landing-content container animate-fade-in">
        <header className="landing-header">
          <div className="landing-logo">
            <Skull size={48} className="logo-icon" />
            <h1 className="landing-brand gradient-text">Pirate Stream</h1>
          </div>
        </header>

        <main className="landing-main">
          <h2 className="landing-title">
            Unchart the Seas of <br />
            <span className="gradient-text">Unlimited Entertainment</span>
          </h2>
          <p className="landing-subtitle">
            Stream your favorite movies and series instantly with crystal clear quality and absolutely zero fees.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="landing-search-form">
            <div className="landing-search-box glass-card">
              <Search className="search-icon" size={22} />
              <input 
                type="text"
                placeholder="Search movies, TV shows, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="landing-search-input"
              />
              <button type="submit" className="landing-search-btn">
                Search
              </button>
            </div>
          </form>

          {/* Go to Home and Featured info */}
          <div className="landing-actions">
            <button 
              className="btn btn-primary btn-landing-enter"
              onClick={() => navigate('/home')}
            >
              Enter Home
              <ArrowRight size={18} className="arrow-icon" />
            </button>
          </div>

          {featuredTitle && (
            <div className="landing-featured-badge glass-card animate-pulse-subtle">
              <span className="badge-tag"><TrendingUp size={12} /> Featured Today</span>
              <span className="badge-title">{featuredTitle}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Landing;
