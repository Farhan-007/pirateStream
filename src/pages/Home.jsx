import React, { useEffect, useState } from 'react';
import { fetchTrending, fetchTopRated, fetchDiscover } from '../utils/api';
import MovieCard from '../components/MovieCard';
import './Home.css';
import { Play, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/api';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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
    return <div className="loader">Loading...</div>;
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
