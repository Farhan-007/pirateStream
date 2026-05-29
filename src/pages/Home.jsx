import React, { useEffect, useState } from 'react';
import { fetchTrending, fetchTopRated, fetchDiscover } from '../utils/api';
import MovieCard from '../components/MovieCard';
import './Home.css';
import { Play, TrendingUp, Tv, Film, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/api';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastWatched, setLastWatched] = useState(null);

  useEffect(() => {
    const savedStr = window.localStorage.getItem('pirate_stream_last_watched');
    if (savedStr) {
      try {
        const saved = JSON.parse(savedStr);
        if (saved && saved.id) {
          setLastWatched(saved);
        }
      } catch (e) {
        console.error("Error parsing last watched state", e);
      }
    }
  }, []);

  const handleDismissLastWatched = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.localStorage.removeItem('pirate_stream_last_watched');
    setLastWatched(null);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendData, topData, discData] = await Promise.all([
          fetchTrending(),
          fetchTopRated(),
          fetchDiscover()
        ]);
        
        setTrending(trendData.results.slice(0, 10));
        setTopRated(topData.results.slice(0, 10));
        setDiscover(discData.results.slice(0, 20));
      } catch (error) {
        console.error("Error loading home data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (trending.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveHeroIndex((prevIndex) => (prevIndex + 1) % trending.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [trending]);

  if (loading) {
    return (
      <div className="home-skeleton">
        {/* Hero skeleton */}
        <div className="sk sk-card home-sk-hero">
          <div className="home-sk-hero-content">
            <div className="sk sk-round home-sk-badge" />
            <div className="sk home-sk-title" />
            <div className="sk home-sk-title home-sk-title-sm" />
            <div className="sk home-sk-overview" />
            <div className="sk home-sk-overview home-sk-overview-sm" />
            <div className="sk sk-round home-sk-btn" />
          </div>
        </div>

        {/* Card grid sections × 3 */}
        {[1, 2, 3].map(s => (
          <div key={s} className="container home-sk-section">
            <div className="sk sk-round home-sk-section-title" />
            <div className="home-sk-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="home-sk-card">
                  <div className="sk sk-card home-sk-poster" />
                  <div className="sk home-sk-label" />
                  <div className="sk home-sk-label home-sk-label-sm" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="home-page animate-fade-in">
      {trending.length > 0 && (
        <div className="hero-carousel">
          <div 
            className="hero-slider"
            style={{ transform: `translateX(-${activeHeroIndex * 100}%)` }}
          >
            {trending.map((movie, index) => (
              <div 
                key={movie.id}
                className={`hero-slide ${index === activeHeroIndex ? 'active' : ''}`}
                style={{
                  backgroundImage: `linear-gradient(to top, var(--bg-dark), transparent), linear-gradient(to right, var(--bg-dark), transparent), url(${getImageUrl(movie.backdrop_path)})`
                }}
              >
                <div className="container hero-content">
                  <span className="hero-badge"><TrendingUp size={16} /> #{index + 1} Trending Today</span>
                  <h1 className="hero-title">{movie.title || movie.name}</h1>
                  <p className="hero-overview">{movie.overview}</p>
                  <div className="hero-actions">
                    <Link to={`/${movie.media_type || (movie.first_air_date ? 'tv' : 'movie')}/${movie.id}`} className="btn btn-primary">
                      <Play size={20} fill="currentColor" /> Watch Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="hero-indicators">
            {trending.map((_, index) => (
              <button
                key={index}
                className={`indicator-dot ${index === activeHeroIndex ? 'active' : ''}`}
                onClick={() => setActiveHeroIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="container sections-container">
        {lastWatched && (
          <section className="continue-section">
            <div className="section-header">
              <h2 className="section-title">Continue <span className="gradient-text">Watching</span></h2>
            </div>
            <div className="continue-card-wrapper">
              <button 
                className="continue-dismiss-btn" 
                onClick={handleDismissLastWatched}
                title="Clear Continue Watching"
              >
                <X size={16} />
              </button>
              <Link 
                to={`/watch/${lastWatched.type}/${lastWatched.id}${lastWatched.type === 'tv' ? `?season=${lastWatched.season}&episode=${lastWatched.episode}` : ''}`} 
                className="continue-card"
              >
                <div className="continue-poster-wrap">
                  <img 
                    src={getImageUrl(lastWatched.poster_path, 'w185')} 
                    alt={lastWatched.title} 
                    className="continue-poster"
                  />
                  <div className="continue-poster-overlay">
                    <Play size={24} fill="currentColor" className="continue-play-icon" />
                  </div>
                </div>
                <div className="continue-info">
                  <span className="continue-media-tag">
                    {lastWatched.type === 'tv' ? <Tv size={12} /> : <Film size={12} />}
                    {lastWatched.type === 'tv' ? 'Series' : 'Movie'}
                  </span>
                  <h3 className="continue-title">{lastWatched.title}</h3>
                  <span className="continue-details">
                    {lastWatched.type === 'tv' 
                      ? `Season ${lastWatched.season} · Episode ${lastWatched.episode}` 
                      : 'Resume Movie'}
                  </span>
                  <div className="continue-progress-wrap">
                    <div className="continue-progress-label">
                      <span>Progress</span>
                      <span>100%</span>
                    </div>
                    <div className="continue-progress-bar">
                      <div className="continue-progress-fill" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}
        <section className="movie-section">
          <div className="section-header">
            <h2 className="section-title">Trending <span className="gradient-text">Now</span></h2>
          </div>
          <div className="movie-grid">
            {trending.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        </section>

        <section className="movie-section">
          <div className="section-header">
            <h2 className="section-title">Top <span className="gradient-text">Rated</span></h2>
          </div>
          <div className="movie-grid">
            {topRated.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        </section>

        <section className="movie-section">
          <div className="section-header">
            <h2 className="section-title">Discover <span className="gradient-text">Movies</span></h2>
          </div>
          <div className="movie-grid discover-grid">
            {discover.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
