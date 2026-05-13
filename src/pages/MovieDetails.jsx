import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails, getImageUrl } from '../utils/api';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { Star, Calendar, Clock, Play } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import './MovieDetails.css';

const MovieDetails = () => {
  const { type = 'movie', id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToHistory } = useWatchHistory();
  const [isPlaying, setIsPlaying] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMovieDetails(id, type);
        setMovie(data);
        console.log(data);
        addToHistory({
          id: data.id,
          title: data.title || data.name,
          poster_path: data.poster_path,
          release_date: data.release_date || data.first_air_date,
          vote_average: data.vote_average,
          media_type: type
        });
        window.scrollTo(0, 0);
        setIsPlaying(false);
      } catch (error) {
        console.error("Error loading movie", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!movie) {
    return <div className="loader">Movie not found</div>;
  }

  return (
    <div className="movie-details-page animate-fade-in">
      <div className="backdrop-container" style={{
        backgroundImage: `linear-gradient(to top, var(--bg-dark) 0%, rgba(10,10,15,0.7) 100%), url(${getImageUrl(movie.backdrop_path)})`
      }}>
      </div>

      <div className="container details-content">
        <div className="details-grid">
          <div className="poster-col">
            <img
              src={getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              className="details-poster glass-card"
            />
          </div>

          <div className="info-col">
            <h1 className="details-title">{movie.title || movie.name}</h1>

            <div className="meta-badges">
              <span className="badge"><Star size={16} fill="currentColor" className="star-icon" /> {movie.vote_average?.toFixed(1)}</span>
              <span className="badge"><Calendar size={16} /> {(movie.release_date || '').split('-')[0]}</span>
              <span className="badge"><Clock size={16} /> {movie.runtime} min</span>
            </div>

            <div className="genres">
              {movie.genres?.map(g => (
                <span key={g.id} className="genre-pill">{g.name}</span>
              ))}
            </div>

            <div className="overview-section">
              <h3>Storyline</h3>
              <p>{movie.overview}</p>
            </div>

            <button
              className="btn btn-primary watch-btn"
              onClick={() => setIsPlaying(true)}
            >
              <Play size={20} fill="currentColor" />
              Stream Now
            </button>
          </div>
        </div>

        {isPlaying && (
          <div className="player-section animate-fade-in">
            <h2 className="section-title">Streaming <span className="gradient-text">Player</span></h2>

            {type === 'tv' && movie.seasons && (
              <div className="episode-selector">
                <select
                  value={season}
                  onChange={(e) => {
                    setSeason(e.target.value);
                    setEpisode(1);
                  }}
                  className="season-select glass-card"
                >
                  {movie.seasons.filter(s => s.season_number > 0).map(s => (
                    <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
                  ))}
                </select>
                <div className="episode-input-container">
                  <label htmlFor="episode-input">Episode:</label>
                  <input
                    id="episode-input"
                    type="number"
                    min="1"
                    value={episode}
                    onChange={(e) => setEpisode(e.target.value)}
                    className="episode-input glass-card"
                  />
                </div>
              </div>
            )}

            <div className="iframe-container glass-card">
              <iframe
                src={type === 'tv' ? `https://vidfast.pro/tv/${movie.id}/${season}/${episode}` : `https://vidfast.pro/movie/${movie.id}`}
                allowFullScreen
                title="Movie Player"
                frameBorder="0"
                className="movie-iframe"
              ></iframe>
            </div>
          </div>
        )}

        {movie.similar?.results?.length > 0 && (
          <div className="similar-section">
            <h2 className="section-title">Similar <span className="gradient-text">Movies</span></h2>
            <div className="movie-grid">
              {movie.similar.results.slice(0, 10).map(m => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
