const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMDlmMDUwYjRlYTgyYTBiZjVlMDhjZWVlY2VhMGY1MCIsIm5iZiI6MTcwNzU4MDE2MS4wNTQwMDAxLCJzdWIiOiI2NWM3OWIwMTU0YTA5ODAxNjMwMTE5ZmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.cRbUW5xJxG-YPkffVmdviUgor9p2S1cZNAddgLm4gRc";
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
  const res = await fetch(`${BASE_URL}/${type}/${id}?append_to_response=credits,similar`, options);
  if (!res.ok) throw new Error('Failed to fetch movie details');
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
