import React from 'react';
import { useState, useEffect } from "react";
import './movieDB.css';
import fallbackPoster from '../assets/404_movie_poster.png';

function MovieDB() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [genreSearch, setGenreSearch] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [baseURL, setBaseURL] = useState('https://0kadddxyh3.execute-api.us-east-1.amazonaws.com/');
  const endpoints = {'authToken': '/auth/token', 'healthCheck': '/healthcheck', 'movies': '/movies', 'moviesSearch': '/movies?search=', 'moviesGenreSearch': '/movies?genre=', 'genresID': '/genres/movies'};

   const getAuthToken = async () => {
        
      try {
        setLoading(true);
        const response = await fetch(baseURL + endpoints.authToken, {});
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const result = await response.json(); 
        const token = result.token;
        setAccessToken(token);
        getGenreID(token)
        setError(null);
        fetchMovieData(token);
      } catch (err) {
        setError(err.message);
        getMovieStatus();
        setData(null);
        setLoading(false);
      }
    };

    const getMovieStatus = async () => {
        
      try {
        setLoading(true);
        const response = await fetch(baseURL + endpoints.healthCheck, {
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const result = await response.json(); 
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
        setLoading(false);
      }
    };
    

    const getMovieByGenre = async (selectedGenre) => {
      setGenreSearch(selectedGenre);
      setSelectedOption(selectedGenre);
        if (searchTerm && searchTerm.trim() !== '') {
          await fetchMovieData(accessToken, 1, { search: searchTerm, genre: selectedGenre });
        } else {
          await fetchMovieData(accessToken, 1, { genre: selectedGenre });
        }
    };

    const getMovieDetails = async (movieId) => {
      try {
        setModalLoading(true);
        const response = await fetch(baseURL + 'movies/' + movieId, {
          headers: {'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const result = await response.json();
        setSelectedMovie(result.data || result);
        setModalLoading(false);
      } catch (err) {
        setModalLoading(false);
      }
    };

    const searchMovies = async (search, genre) => {
        setSearchTerm(search);
        setSearchPerformed(true);
        await fetchMovieData(accessToken, 1, { search: search, genre: genre });
    };

    const getGenreID = async (token) => {

      try {
        setLoading(true);
        const response = await fetch(baseURL + endpoints.genresID, {
            headers: {'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const result = await response.json(); 
        setGenres(result.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
        setLoading(false);
      }
    };

   const fetchMovieData = async (token, page = 1, options = {}) => {
      try {
        setLoading(true);

        let url = baseURL + endpoints.movies;
        if (options.search) {
          url = baseURL + endpoints.moviesSearch + encodeURIComponent(options.search) + `&page=${page}&limit=${pageSize}`;
          if (options.genre) {
            url += `&genre=${encodeURIComponent(options.genre)}`;
          }
        } else if (options.genre) {
          url = baseURL + endpoints.moviesGenreSearch + encodeURIComponent(options.genre) + `&page=${page}&limit=${pageSize}`;
        } else {
          url = baseURL + endpoints.movies + `?page=${page}&limit=${pageSize}`;
        }

        const response = await fetch(url, {
          headers: {'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setCurrentPage(page);
        setTotalPages(result.totalPages || 1);
        setError(null);
      } catch (err) {
        getMovieStatus();
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    getAuthToken();
  }, []);

   useEffect(() => {
  }, [accessToken]);

  const getPageRange = () => {
    const maxButtons = 9;
    const total = totalPages;
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > total) {
      end = total;
      start = total - maxButtons + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div>
      <h1>Movie Database</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="text" placeholder="Search movies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') searchMovies(searchTerm, selectedOption); }} style={{ padding: '10px', fontSize: '16px', flex: 1, border: '2px solid #ddd', borderRadius: '10px' }} />
          <button style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#727272', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#53a1f5'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#727272'}
        onClick={() => searchMovies(searchTerm, selectedOption)}
          >
            Search
          </button>
          <button style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#727272', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#53a1f5'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#727272'}
          onClick={() => {getAuthToken(); setSearchTerm(""); setSelectedOption(''); setGenreSearch(''); setSearchPerformed(false);}}
          >
            Clear Search
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: '240px' }}>
          <label style={{ marginRight: '10px' }}>Filter by Genre: </label>
          <select value={selectedOption} onChange={(e) => {setSelectedOption(e.target.value); getMovieByGenre(e.target.value);}} style={{ padding: '8px', fontSize: '16px' }}>
            <option value="">Select a genre</option>
            {genres && genres.map((genre) => (
              <option key={genre.id} value={genre.title}>
                {genre.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {searchPerformed && data && data.data && data.data.length > 0 && (
        <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
          <strong>{data.data.length} results found</strong>
        </div>
      )}  

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data && (
        <div>
          {Array.isArray(data.data) ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {data.data.map((movie, index) => (
                  <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <img src={movie.posterUrl || fallbackPoster} alt={movie.title || 'No poster available'} style={{ width: '100%', marginTop: '10px', cursor: 'pointer' }} onClick={() => getMovieDetails(movie.id)} />
                    {movie.title && <h3>{movie.title}</h3>}
                    {movie.year && <p><strong>Year:</strong> {movie.year}</p>}
                    {movie.genre && <p><strong>Genre:</strong> {movie.genre}</p>}
                    {movie.rating && <p><strong>Rating:</strong> {movie.rating}</p>}
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => {
                    const newPage = Math.max(currentPage - 1, 1);
                    const options = selectedOption ? { genre: selectedOption } : (searchTerm ? { search: searchTerm } : {});
                    fetchMovieData(accessToken, newPage, options);
                  }} disabled={currentPage === 1} style={{ padding: '8px 12px', backgroundColor: currentPage === 1 ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>← Prev</button>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {getPageRange().map((p) => (
                    <button key={p} onClick={() => {
                      const options = selectedOption ? { genre: selectedOption } : (searchTerm ? { search: searchTerm } : {});
                      fetchMovieData(accessToken, p, options);
                    }} style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: p === currentPage ? '2px solid #0056b3' : '1px solid #ddd',
                      backgroundColor: p === currentPage ? '#e6f0ff' : 'white',
                      cursor: p === currentPage ? 'default' : 'pointer'
                    }} disabled={p === currentPage}>
                      {p}
                    </button>
                  ))}
                </div>

                <button onClick={() => {
                    const newPage = Math.min(currentPage + 1, totalPages);
                    const options = selectedOption ? { genre: selectedOption } : (searchTerm ? { search: searchTerm } : {});
                    fetchMovieData(accessToken, newPage, options);
                  }} disabled={currentPage === totalPages} style={{ padding: '8px 12px', backgroundColor: currentPage === totalPages ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next →</button>
              </div>
            </>
          ) : (
            <div>
              <p>Data structure: {typeof data}</p>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {selectedMovie && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedMovie(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            display: 'flex',
            gap: '30px'
          }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedMovie(null)} style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              color: 'black',
              border: 'none',
              width: '36px',
              height: '36px',
              fontSize: '20px',
              cursor: 'pointer'
            }}>×</button>

            {modalLoading && <p style={{ textAlign: 'center', width: '100%' }}>Loading...</p>}

            {!modalLoading && (
              <>
                <div style={{ flex: '0 0 300px', minWidth: '300px' }}>
                  {selectedMovie.posterUrl ? (
                    <img src={selectedMovie.posterUrl} alt={selectedMovie.title} onError={(e) => { e.target.src = fallbackPoster; }} style={{
                      width: '100%',
                      borderRadius: '8px'
                    }} />
                  ) : (
                    <img src={fallbackPoster} alt="No poster available" style={{
                      width: '100%',
                      borderRadius: '8px'
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, overflow: 'auto', textAlign: 'left', maxHeight: '500px' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{selectedMovie.title}</h2>
                  
                  <div style={{ lineHeight: '1.8' }}>
                    {Object.entries(selectedMovie).map(([key, value]) => {
                      if (key === 'posterUrl' || key === 'title' || key === 'id') return null;
                      
                      if (value === null || value === undefined) return null;
                      
                      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      
                      let displayValue = String(value);
                      if (key === 'genres' && value.length > 0) {
                        let genreList = '';

                        for (let gn = 0; gn < value.length; gn++) {
                          genreList = genreList + value[gn].title + ", ";
                        }
                        genreList = genreList.slice(0, -2); 
                        displayValue = genreList;
                      }

                      if (key === 'duration' && value) {
                        let formattedDuration = ''
                        const s = String(value);
                        const hMatch = s.match(/(\d+)\s*H/i);
                        const mMatch = s.match(/(\d+)\s*M/i);
                        const hours = hMatch ? parseInt(hMatch[1], 10) : null;
                        const minutes = mMatch ? parseInt(mMatch[1], 10) : null;

                        if (hours){
                            formattedDuration = hours + ' Hours '
                        }

                        if (minutes){
                            formattedDuration = formattedDuration + minutes + ' Minutes';
                        }

                        displayValue = formattedDuration;
                      }
                     
                      return (
                        <p key={key} style={{ marginBottom: '8px' }}>
                          <strong>{formattedKey}:</strong> {displayValue}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDB;