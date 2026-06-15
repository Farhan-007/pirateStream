import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchMovieDetails, fetchSeasonDetails, getImageUrl } from '../utils/api';
import { Star, Calendar, Clock, ArrowLeft, Play, Tv, Film } from 'lucide-react';
import './Watch.css';

const Watch = () => {
  const { type = 'movie', id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramSeason = searchParams.get('season');
  const paramEpisode = searchParams.get('episode');

  const [media, setMedia] = useState(null);
  const [loadingMedia, setLoadingMedia] = useState(true);

  // Initialize selected season and episode from query parameters, individual TV progress keys, or old progress keys
  const [selectedSeason, setSelectedSeason] = useState(() => {
    if (type === 'tv') {
      if (paramSeason) return parseInt(paramSeason, 10);

      // 1. Check progress:${id} key (matches player format)
      const playerProgressStr = window.localStorage.getItem(`progress:${id}`);
      if (playerProgressStr) {
        try {
          const progress = JSON.parse(playerProgressStr);
          if (progress && progress.last_season_watched) {
            return parseInt(progress.last_season_watched, 10);
          }
        } catch (e) { }
      }

      // 2. Check old individual progress key
      const tvProgressStr = window.localStorage.getItem(`pirate_stream_tv_progress_${id}`);
      if (tvProgressStr) {
        try {
          const tvProgress = JSON.parse(tvProgressStr);
          if (tvProgress && tvProgress.season) {
            return tvProgress.season;
          }
        } catch (e) { }
      }

      // 3. Fall back to overall last watched
      const savedStr = window.localStorage.getItem('pirate_stream_last_watched');
      if (savedStr) {
        try {
          const saved = JSON.parse(savedStr);
          if (saved && String(saved.id) === String(id) && saved.type === 'tv' && saved.season) {
            return saved.season;
          }
        } catch (e) { }
      }
    }
    return 1;
  });

  const [selectedEpisode, setSelectedEpisode] = useState(() => {
    if (type === 'tv') {
      if (paramEpisode) return parseInt(paramEpisode, 10);

      // 1. Check progress:${id} key (matches player format)
      const playerProgressStr = window.localStorage.getItem(`progress:${id}`);
      if (playerProgressStr) {
        try {
          const progress = JSON.parse(playerProgressStr);
          if (progress && progress.last_episode_watched) {
            return parseInt(progress.last_episode_watched, 10);
          }
        } catch (e) { }
      }

      // 2. Check old individual progress key
      const tvProgressStr = window.localStorage.getItem(`pirate_stream_tv_progress_${id}`);
      if (tvProgressStr) {
        try {
          const tvProgress = JSON.parse(tvProgressStr);
          if (tvProgress && tvProgress.episode) {
            return tvProgress.episode;
          }
        } catch (e) { }
      }

      // 3. Fall back to overall last watched
      const savedStr = window.localStorage.getItem('pirate_stream_last_watched');
      if (savedStr) {
        try {
          const saved = JSON.parse(savedStr);
          if (saved && String(saved.id) === String(id) && saved.type === 'tv' && saved.episode) {
            return saved.episode;
          }
        } catch (e) { }
      }
    }
    return 1;
  });

  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [playerSrc, setPlayerSrc] = useState('');
  const [playerReady, setPlayerReady] = useState(false);

  const loadCount = useRef(0);
  const isInitialLoad = useRef(true);

  const seasons = media?.seasons?.filter(s => s.season_number > 0) || [];

  // Reset load count when player URL changes
  useEffect(() => {
    loadCount.current = 0;
  }, [playerSrc]);

  /* ── Listen for player postMessages (timeupdates, progress, and episode changes) ── */
  useEffect(() => {
    const handleMessage = (event) => {
      // Validate origin to ensure it's from the player iframe
      if (!event.origin.includes('vidfast.pro') && !event.origin.includes('vidfast')) return;

      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!payload) return;

        console.log("Received postMessage from Vidfast player:", payload);

        // Check if message is progress update or states change
        if (payload.last_season_watched || payload.last_episode_watched || payload.progress) {
          const season = parseInt(payload.last_season_watched || payload.season, 10);
          const episode = parseInt(payload.last_episode_watched || payload.episode, 10);

          if (!isNaN(season) && season > 0) {
            setSelectedSeason(season);
          }
          if (!isNaN(episode) && episode > 0) {
            setSelectedEpisode(episode);
          }

          // Read existing progress object
          const progressKey = `progress:${id}`;
          const existingStr = window.localStorage.getItem(progressKey);
          let existingObj = {};
          if (existingStr) {
            try { existingObj = JSON.parse(existingStr); } catch (e) { }
          }

          // Build merged progress object
          const mergedObj = {
            ...existingObj,
            id: parseInt(id, 10),
            type: type,
            title: media?.title || media?.name,
            poster_path: media?.poster_path,
            backdrop_path: media?.backdrop_path,
            last_season_watched: !isNaN(season) ? season : (existingObj.last_season_watched || selectedSeason),
            last_episode_watched: !isNaN(episode) ? episode : (existingObj.last_episode_watched || selectedEpisode),
            last_updated: Date.now(),
            progress: payload.progress || existingObj.progress || { watched: 0, duration: 1 },
            show_progress: payload.show_progress || existingObj.show_progress || {}
          };

          // Save to local storage
          window.localStorage.setItem(progressKey, JSON.stringify(mergedObj));
          window.localStorage.setItem('pirate_stream_last_watched', JSON.stringify(mergedObj));
        }

        // Handle standard JW/custom player end states
        if (payload.event === 'next' || payload.event === 'ended' || payload.event === 'complete') {
          handleIframeTransition();
        }
      } catch (e) {
        // Suppress parsing errors of unrelated postmessages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [media, selectedSeason, selectedEpisode, episodes, id, type]);

  /* ── Save progress when manual details change ── */
  useEffect(() => {
    if (!media) return;

    const progressKey = `progress:${media.id}`;
    const existingStr = window.localStorage.getItem(progressKey);
    let existingObj = {};
    if (existingStr) {
      try {
        existingObj = JSON.parse(existingStr);
      } catch (e) { }
    }

    const updatedObj = {
      ...existingObj,
      id: media.id,
      type: type,
      title: media.title || media.name,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      vote_average: media.vote_average,
      release_date: media.release_date || media.first_air_date,
      last_season_watched: type === 'tv' ? selectedSeason : null,
      last_episode_watched: type === 'tv' ? selectedEpisode : null,
      last_updated: Date.now(),
      progress: existingObj.progress || { watched: 0, duration: 1 },
      show_progress: existingObj.show_progress || {}
    };

    // If it's a TV show, update the specific sXeX key in show_progress!
    if (type === 'tv') {
      const epKey = `s${selectedSeason}e${selectedEpisode}`;
      if (!updatedObj.show_progress) updatedObj.show_progress = {};
      updatedObj.show_progress[epKey] = {
        season: selectedSeason,
        episode: selectedEpisode,
        progress: updatedObj.show_progress[epKey]?.progress || { watched: 0, duration: 1 },
        last_updated: Date.now()
      };

      // Backwards compatible old key
      const tvProgress = { season: selectedSeason, episode: selectedEpisode };
      window.localStorage.setItem(`pirate_stream_tv_progress_${media.id}`, JSON.stringify(tvProgress));
    }

    window.localStorage.setItem(progressKey, JSON.stringify(updatedObj));
    window.localStorage.setItem('pirate_stream_last_watched', JSON.stringify(updatedObj));
  }, [media, selectedSeason, selectedEpisode, type]);

  /* ── Load media details ── */
  useEffect(() => {
    const load = async () => {
      setLoadingMedia(true);
      setPlayerReady(false);
      try {
        const data = await fetchMovieDetails(id, type);
        setMedia(data);

        let initialSeason = 1;
        let initialEpisode = 1;

        if (type === 'tv' && data.seasons?.length) {
          if (paramSeason && paramEpisode) {
            initialSeason = parseInt(paramSeason, 10);
            initialEpisode = parseInt(paramEpisode, 10);
          } else {
            // 1. Check individual show progress using progress:${id}
            const tvProgressStr = window.localStorage.getItem(`progress:${id}`);
            if (tvProgressStr) {
              try {
                const tvProgress = JSON.parse(tvProgressStr);
                if (tvProgress && tvProgress.last_season_watched) {
                  initialSeason = tvProgress.last_season_watched;
                  initialEpisode = tvProgress.last_episode_watched || 1;
                } else {
                  const firstReal = data.seasons.find(s => s.season_number > 0);
                  if (firstReal) initialSeason = firstReal.season_number;
                }
              } catch (e) {
                const firstReal = data.seasons.find(s => s.season_number > 0);
                if (firstReal) initialSeason = firstReal.season_number;
              }
            } else {
              // 2. Fall back to old show progress if available
              const oldProgressStr = window.localStorage.getItem(`pirate_stream_tv_progress_${id}`);
              if (oldProgressStr) {
                try {
                  const oldProgress = JSON.parse(oldProgressStr);
                  if (oldProgress && oldProgress.season) {
                    initialSeason = oldProgress.season;
                    initialEpisode = oldProgress.episode || 1;
                  } else {
                    const firstReal = data.seasons.find(s => s.season_number > 0);
                    if (firstReal) initialSeason = firstReal.season_number;
                  }
                } catch (e) {
                  const firstReal = data.seasons.find(s => s.season_number > 0);
                  if (firstReal) initialSeason = firstReal.season_number;
                }
              } else {
                // 3. Fall back to overall last watched if matching
                const savedStr = window.localStorage.getItem('pirate_stream_last_watched');
                if (savedStr) {
                  const saved = JSON.parse(savedStr);
                  if (saved && String(saved.id) === String(id) && saved.type === 'tv' && saved.season) {
                    initialSeason = saved.season;
                    initialEpisode = saved.episode || 1;
                  } else {
                    const firstReal = data.seasons.find(s => s.season_number > 0);
                    if (firstReal) initialSeason = firstReal.season_number;
                  }
                } else {
                  const firstReal = data.seasons.find(s => s.season_number > 0);
                  if (firstReal) initialSeason = firstReal.season_number;
                }
              }
            }
          }
          setSelectedSeason(initialSeason);
          setSelectedEpisode(initialEpisode);
          setPlayerSrc(`https://vidfast.pro/tv/${id}/${initialSeason}/${initialEpisode}`);
        } else {
          setPlayerSrc(`https://vidfast.pro/movie/${id}`);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMedia(false);
      }
    };
    load();
  }, [id, type, paramSeason, paramEpisode]);

  /* ── Load episodes when season changes ── */
  useEffect(() => {
    if (type !== 'tv' || !media) return;
    const load = async () => {
      setLoadingEpisodes(true);
      setPlayerReady(false);
      try {
        const data = await fetchSeasonDetails(id, selectedSeason);
        setEpisodes(data.episodes || []);

        if (isInitialLoad.current) {
          isInitialLoad.current = false;
        } else {
          setSelectedEpisode(1);
          setPlayerSrc(`https://vidfast.pro/tv/${id}/${selectedSeason}/1`);
        }
      } catch (e) {
        console.error(e);
        setEpisodes([]);
      } finally {
        setLoadingEpisodes(false);
      }
    };
    load();
  }, [selectedSeason, media, id, type]);

  /* ── Pick episode manually ── */
  const pickEpisode = useCallback((epNum) => {
    setSelectedEpisode(epNum);
    setPlayerReady(false);
    setPlayerSrc(`https://vidfast.pro/tv/${id}/${selectedSeason}/${epNum}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, selectedSeason]);

  const handleIframeTransition = () => {
    if (type !== 'tv') return;
    setSelectedEpisode(prev => {
      const nextEp = prev + 1;
      const hasNextEp = episodes.some(e => e.episode_number === nextEp);
      if (hasNextEp) {
        return nextEp;
      } else {
        // Go to next season if there is one
        const currentSeasonIdx = seasons.findIndex(s => s.season_number === selectedSeason);
        if (currentSeasonIdx !== -1 && currentSeasonIdx < seasons.length - 1) {
          const nextSeasonNum = seasons[currentSeasonIdx + 1].season_number;
          setSelectedSeason(nextSeasonNum);
          setPlayerSrc(`https://vidfast.pro/tv/${id}/${nextSeasonNum}/1`);
          return 1;
        }
      }
      return prev;
    });
  };

  const handleOnLoad = () => {
    loadCount.current += 1;
    if (loadCount.current === 1) {
      setPlayerReady(true);
    } else if (loadCount.current > 1) {
      handleIframeTransition();
    }
  };

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
            {/* Season pills — mobile only (appears after episode list) */}
            <SeasonPills className="mobile-seasons" />
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
              key={playerSrc}
              src={playerSrc}
              allowFullScreen
              title="Stream Player"
              frameBorder="0"
              onLoad={handleOnLoad}
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
