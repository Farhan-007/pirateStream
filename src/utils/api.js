const API_TOKEN = import.meta.env.VITE_TMDB_API_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_TOKEN}`
  }
};

export const fetchTrending = async () => {
  const res = await fetch(`${BASE_URL}/trending/all/day`, options);
  if (!res.ok) throw new Error('Failed to fetch trending');
  return res.json();
};

export const fetchTopRated = async () => {
  const res = await fetch(`${BASE_URL}/movie/top_rated`, options);
  if (!res.ok) throw new Error('Failed to fetch top rated');
  return res.json();
};

export const fetchDiscover = async () => {
  const res = await fetch(`${BASE_URL}/discover/movie?sort_by=popularity.desc`, options);
  if (!res.ok) throw new Error('Failed to fetch discover');
  return res.json();
};

export const fetchMovieDetails = async (id, type = 'movie') => {
  const res = await fetch(`${BASE_URL}/${type}/${id}?append_to_response=credits,similar,videos`, options);
  if (!res.ok) throw new Error('Failed to fetch movie details');
  return res.json();
};

export const fetchSeasonDetails = async (seriesId, seasonNumber) => {
  const res = await fetch(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}`, options);
  if (!res.ok) throw new Error('Failed to fetch season details');
  return res.json();
};

export const searchMovies = async (query) => {
  const res = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`, options);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
};

export const getImageUrl = (path, size = 'original') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
