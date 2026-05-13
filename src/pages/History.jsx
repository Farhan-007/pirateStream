import React from 'react';
import { useWatchHistory } from '../hooks/useWatchHistory';
import MovieCard from '../components/MovieCard';
import { Trash2, History as HistoryIcon } from 'lucide-react';
import './History.css';

const History = () => {
  const { history, clearHistory, removeFromHistory } = useWatchHistory();

  return (
    <div className="history-page container animate-fade-in">
      <div className="history-header">
        <div>
          <h1 className="page-title">Watch <span className="gradient-text">History</span></h1>
          <p className="page-subtitle">Movies you've recently viewed</p>
        </div>
        {history.length > 0 && (
          <button className="btn btn-glass" onClick={clearHistory}>
            <Trash2 size={18} /> Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state glass-card">
          <HistoryIcon size={64} className="empty-icon" />
          <h2>No History Yet</h2>
          <p>Start watching movies to build up your history!</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map(movie => (
            <div key={movie.id} className="history-card-wrapper">
              <MovieCard movie={movie} />
              <button 
                className="remove-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFromHistory(movie.id);
                }}
                title="Remove from history"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
