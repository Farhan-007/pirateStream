import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails, getImageUrl } from '../utils/api';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { Star, Calendar, Clock, Play } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import './MovieDetails.css';

const MovieDetails = () => {
  const { type = 'movie', id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToHistory } = useWatchHistory();

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
              onClick={() => navigate(`/watch/${type}/${id}`)}
            >
              <Play size={20} fill="currentColor" />
              Stream Now
            </button>
          </div>
        </div>



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
