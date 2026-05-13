import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../utils/api';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon } from 'lucide-react';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const data = await searchMovies(query);
        const filteredResults = (data.results || []).filter(item => item.media_type !== 'person');
        setResults(filteredResults);
      } catch (error) {
        console.error('Error searching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="search-page container animate-fade-in">
      <div className="search-header">
        <h1 className="page-title">
          Search Results for <span className="gradient-text">"{query}"</span>
        </h1>
      </div>

      {loading ? (
        <div className="loader">Searching...</div>
      ) : results.length === 0 ? (
        <div className="empty-state glass-card">
          <SearchIcon size={64} className="empty-icon" />
          <h2>No Results Found</h2>
          <p>We couldn't find any movies matching "{query}". Try another search term.</p>
        </div>
      ) : (
        <div className="search-grid">
          {results.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
