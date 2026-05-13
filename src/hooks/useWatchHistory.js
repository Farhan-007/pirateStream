import { useState, useEffect } from 'react';

const HISTORY_KEY = 'moviesite_history';

export const useWatchHistory = () => {
  const [history, setHistory] = useState(() => {
    try {
      const item = window.localStorage.getItem(HISTORY_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading history from localStorage', error);
      return [];
    }
  });

  const addToHistory = (movie) => {
    setHistory((prev) => {
      // Remove if already exists
      const filtered = prev.filter((m) => m.id !== movie.id);
      const newHistory = [movie, ...filtered].slice(0, 50); // keep last 50
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeFromHistory = (id) => {
    setHistory((prev) => {
      const newHistory = prev.filter((m) => m.id !== id);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    window.localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
};
