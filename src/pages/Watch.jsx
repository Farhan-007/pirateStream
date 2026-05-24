import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails, fetchSeasonDetails, getImageUrl } from '../utils/api';
import { Star, Calendar, Clock, ArrowLeft, Play, Tv, Film } from 'lucide-react';
import './Watch.css';
const Watch = () => {
  const { type = 'movie', id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [playerKey, setPlayerKey] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  /* ── Load media details ── */
  useEffect(() => {
    const load = async () => {
      setLoadingMedia(true);
      setPlayerReady(false);
      try {
        const data = await fetchMovieDetails(id, type);
        setMedia(data);
        if (type === 'tv' && data.seasons?.length) {
          const firstReal = data.seasons.find(s => s.season_number > 0);
          if (firstReal) setSelectedSeason(firstReal.season_number);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMedia(false);
      }
    };
    load();
  }, [id, type]);
  /* ── Load episodes when season changes ── */
  useEffect(() => {
    if (type !== 'tv' || !media) return;
    const load = async () => {
      setLoadingEpisodes(true);
      setPlayerReady(false);
      try {
        const data = await fetchSeasonDetails(id, selectedSeason);
        setEpisodes(data.episodes || []);
        setSelectedEpisode(1);
        setPlayerKey(k => k + 1);
      } catch (e) {
        console.error(e);
        setEpisodes([]);
      } finally {
        setLoadingEpisodes(false);
      }
    };
    load();
  }, [selectedSeason, media, id, type]);
  /* ── Pick episode ── */
  const pickEpisode = useCallback((epNum) => {
    setSelectedEpisode(epNum);
    setPlayerReady(false);
    setPlayerKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const playerSrc =
    type === 'tv'
      ? `https://vidfast.pro/tv/${id}/${selectedSeason}/${selectedEpisode}`
      : `https://vidfast.pro/movie/${id}`;
  const seasons = media?.seasons?.filter(s => s.season_number > 0) || [];
  const isTv = type === 'tv';
  if (loadingMedia) {
    return (
      <div className="watch-loader animate-fade-in">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );
  }
  if (!media) return <div className="watch-loader">Content not found.</div>;
  const title = media.title || media.name;
  const year = (media.release_date || media.first_air_date || '').split('-')[0];
  /* Season pill buttons — reused in two spots */
  const SeasonPills = ({ className = '' }) =>
    isTv && seasons.length > 0 ? (
      <div className={`season-pills-wrap ${className}`}>
        <span className="season-pills-label">Season</span>
        <div className="season-pills">
          {seasons.map(s => (
            <button
              key={s.id}
              className={`season-pill ${selectedSeason === s.season_number ? 'active' : ''}`}
              onClick={() => setSelectedSeason(s.season_number)}
              title={s.episode_count ? `${s.episode_count} episodes` : undefined}
            >
              S{s.season_number}
            </button>
          ))}
        </div>
      </div>
    ) : null;
  return (
    <div className="watch-page animate-fade-in">
      <div
        className="watch-backdrop"
        style={{ backgroundImage: `url(${getImageUrl(media.backdrop_path)})` }}
      />
      {/*
        Desktop grid: [sidebar 360px] [main 1fr]
        Both columns start at the same row — tops are aligned.
        Mobile: single column, order controlled via CSS order property:
          1. back btn (inside main)
          2. player   (inside main)
          3. episode list (sidebar)
          4. season pills (sidebar)
          5. description  (inside main, pushed down via order)
      */}
      <div className={`watch-container ${isTv ? 'has-sidebar' : ''}`}>
        {/* ── SIDEBAR ── */}
        {isTv && seasons.length > 0 && (
          <div className="watch-sidebar">
            {/* Season pills — desktop: top of sidebar; mobile: after episode list */}
            <SeasonPills className="desktop-seasons" />
            {/* Episode list */}
            <div className="sidebar-section">
              <div className="sidebar-header">
                <Tv size={16} />
                Episodes
                <span className="ep-count-badge">
                  {loadingEpisodes ? '…' : episodes.length}
                </span>
              </div>
              <ul className="episode-list" id="episode-list">
                {loadingEpisodes
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <li key={i} className="ep-skeleton" />
                  ))
                  : episodes.map(ep => (
                    <li
                      key={ep.id}
                      className={`episode-item ${selectedEpisode === ep.episode_number ? 'active' : ''}`}
                      onClick={() => pickEpisode(ep.episode_number)}
                      title={ep.name}
                    >
                      <span className="ep-number">{ep.episode_number}</span>
                      <div className="ep-info">
                        <div className="ep-name">{ep.name || `Episode ${ep.episode_number}`}</div>
                        {ep.runtime > 0 && (
                          <div className="ep-runtime">{ep.runtime} min</div>
                        )}
                      </div>
                      <Play size={14} className="ep-play-icon" fill="currentColor" />
                    </li>
                  ))}
              </ul>
            </div>
            {/* Season pills — mobile only (appears after episode list) */}
            <SeasonPills className="mobile-seasons" />
          </div>
        )}
        {/* ── MAIN ── */}
        <div className="watch-main">
          <button className="watch-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={17} />
            Back to details
          </button>
          <div className="player-wrapper">
            {!playerReady && (
              <div className="player-loading">
                <div className="spinner" />
                <span>Buffering stream…</span>
              </div>
            )}
            <iframe
              key={playerKey}
              src={playerSrc}
              allowFullScreen
              title="Stream Player"
              frameBorder="0"
              onLoad={() => setPlayerReady(true)}
              allow="autoplay; fullscreen"
            />
          </div>
          {/* Info bar — title, badges, overview */}
          <div className="watch-info-bar">
            <h1 className="watch-title">
              {title}
              {isTv && (
                <span className="gradient-text"> · S{selectedSeason} E{selectedEpisode}</span>
              )}
            </h1>
            <div className="watch-meta">
              <span className="watch-badge highlight">
                {isTv ? <Tv size={14} /> : <Film size={14} />}
                {isTv ? 'Series' : 'Movie'}
              </span>
              {media.vote_average > 0 && (
                <span className="watch-badge">
                  <Star size={13} fill="currentColor" style={{ color: 'var(--primary)' }} />
                  {media.vote_average?.toFixed(1)}
                </span>
              )}
              {year && (
                <span className="watch-badge">
                  <Calendar size={13} />
                  {year}
                </span>
              )}
              {media.runtime > 0 && (
                <span className="watch-badge">
                  <Clock size={13} />
                  {media.runtime} min
                </span>
              )}
            </div>
            {/* Description */}
            {media.overview && (
              <p className="watch-overview">{media.overview}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Watch;
