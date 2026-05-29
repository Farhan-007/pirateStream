import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails, getImageUrl } from '../utils/api';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { Star, Calendar, Clock, Play, Clapperboard, X } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import './MovieDetails.css';

const MovieDetails = () => {
  const { type = 'movie', id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToHistory } = useWatchHistory();
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);

  useEffect(() => {
    // Load individual TV show progress if applicable
    if (type === 'tv') {
      const playerProgressStr = window.localStorage.getItem(`progress:${id}`);
      const oldProgressStr = window.localStorage.getItem(`pirate_stream_tv_progress_${id}`);
      
      if (playerProgressStr) {
        try {
          const progressObj = JSON.parse(playerProgressStr);
          if (progressObj && progressObj.last_season_watched) {
            setSavedProgress({
              season: parseInt(progressObj.last_season_watched, 10),
              episode: parseInt(progressObj.last_episode_watched, 10) || 1
            });
          } else {
            setSavedProgress(null);
          }
        } catch (e) {
          setSavedProgress(null);
        }
      } else if (oldProgressStr) {
        try {
          const progress = JSON.parse(oldProgressStr);
          if (progress && progress.season) {
            setSavedProgress(progress);
          }
        } catch (e) {
          setSavedProgress(null);
        }
      } else {
        setSavedProgress(null);
      }
    } else {
      setSavedProgress(null);
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMovieDetails(id, type);
        setMovie(data);

        // Pick best trailer from videos
        const videos = data.videos?.results || [];
        const trailer =
          videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
          videos.find(v => v.site === 'YouTube');
        setTrailerKey(trailer?.key || null);

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
        console.error('Error loading movie', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, type]);

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowTrailer(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showTrailer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showTrailer]);

  if (loading) {
    return (
      <div className="md-skeleton animate-fade-in">
        {/* backdrop */}
        <div className="sk md-sk-backdrop" />
        <div className="container md-sk-body">
          {/* poster + info row */}
          <div className="md-sk-grid">
            <div className="sk sk-card md-sk-poster" />
            <div className="md-sk-info">
              <div className="sk md-sk-title" />
              <div className="sk md-sk-title md-sk-title-sm" />
              <div className="md-sk-badges">
                {[1,2,3].map(i => <div key={i} className="sk sk-round md-sk-badge" />)}
              </div>
              <div className="md-sk-genres">
                {[1,2,3,4].map(i => <div key={i} className="sk md-sk-genre" />)}
              </div>
              <div className="sk md-sk-line" />
              <div className="sk md-sk-line" />
              <div className="sk md-sk-line md-sk-line-sm" />
              <div className="md-sk-actions">
                <div className="sk sk-round md-sk-action-btn" />
                <div className="sk sk-round md-sk-action-btn" />
              </div>
            </div>
          </div>
          {/* similar grid */}
          <div className="sk md-sk-section-title" />
          <div className="md-sk-similar">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="sk sk-card md-sk-sim-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!movie) return <div className="loader">Movie not found</div>;


  return (
    <div className="movie-details-page animate-fade-in">
      <div
        className="backdrop-container"
        style={{
          backgroundImage: `linear-gradient(to top, var(--bg-dark) 0%, rgba(10,10,15,0.7) 100%), url(${getImageUrl(movie.backdrop_path)})`
        }}
      />

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
              <span className="badge"><Calendar size={16} /> {(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
              {movie.runtime > 0 && <span className="badge"><Clock size={16} /> {movie.runtime} min</span>}
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

            {/* ── Action buttons ── */}
            <div className="action-btns">
              {savedProgress ? (
                <button
                  className="btn btn-primary watch-btn"
                  onClick={() => navigate(`/watch/${type}/${id}?season=${savedProgress.season}&episode=${savedProgress.episode}`)}
                >
                  <Play size={20} fill="currentColor" />
                  Resume S{savedProgress.season} E{savedProgress.episode}
                </button>
              ) : (
                <button
                  className="btn btn-primary watch-btn"
                  onClick={() => navigate(`/watch/${type}/${id}`)}
                >
                  <Play size={20} fill="currentColor" />
                  Stream Now
                </button>
              )}

              {trailerKey && (
                <button
                  className="btn btn-trailer watch-btn"
                  onClick={() => setShowTrailer(true)}
                  id="trailer-btn"
                >
                  <Clapperboard size={20} />
                  Watch Trailer
                </button>
              )}
            </div>
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

      {/* ── Trailer Modal ── */}
      {showTrailer && (
        <div
          className="trailer-overlay animate-fade-in"
          onClick={() => setShowTrailer(false)}
          id="trailer-modal-overlay"
        >
          <div
            className="trailer-modal"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="trailer-close"
              onClick={() => setShowTrailer(false)}
              aria-label="Close trailer"
            >
              <X size={22} />
            </button>
            <div className="trailer-frame-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Trailer"
                allowFullScreen
                allow="autoplay; fullscreen"
                frameBorder="0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
