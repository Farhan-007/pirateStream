import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { getImageUrl } from '../utils/api';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
  return (
    <Link to={`/${type}/${movie.id}`} className="movie-card glass-card">
      <div className="movie-poster-wrapper">
        <img 
          src={getImageUrl(movie.poster_path, 'w500')} 
          alt={movie.title} 
          className="movie-poster"
          loading="lazy"
        />
        <div className="play-overlay">
          <div className="play-btn">
            <Play fill="currentColor" size={24} />
          </div>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title || movie.name}</h3>
        <div className="movie-meta">
          <span className="movie-year">
            {(movie.release_date || movie.first_air_date || 'N/A').split('-')[0]}
          </span>
          <span className="movie-rating">
            <Star size={14} fill="currentColor" className="star-icon" />
            {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
