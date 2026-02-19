// TMDB API Configuration
const API_KEY = '6d4450af4e3eecc4a95e1fc28c31b4fc';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500/';

// Sections configuration
const SECTIONS = [
    { id: 'trending', title: 'Trending Now', endpoint: '/trending/movie/week' },
    { id: 'popular', title: 'Popular on Netflix', endpoint: '/movie/popular' },
    { id: 'top-rated', title: 'Top Rated', endpoint: '/movie/top_rated' },
    { id: 'anime', title: 'Anime', genreId: 16 },
    { id: 'action', title: 'Action', genreId: 28 },
    { id: 'thrillers', title: 'Thrillers', genreId: 53 },
    { id: 'comedy', title: 'Comedy', genreId: 35 },
    { id: 'horror', title: 'Horror', genreId: 27 },
    { id: 'romance', title: 'Romance', genreId: 10749 },
    { id: 'sci-fi', title: 'Sci-Fi', genreId: 878 }
];

// LocalStorage keys
const STORAGE_KEYS = {
    CONTINUE_WATCHING: 'netflix_continue_watching',
    MY_LIST: 'netflix_my_list'
};

// State
let myList = JSON.parse(localStorage.getItem(STORAGE_KEYS.MY_LIST) || '[]');
let continueWatching = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTINUE_WATCHING) || '[]');

// DOM Elements
const loadingElement = document.getElementById('loading');
const errorMessageElement = document.getElementById('error-message');
const navbar = document.querySelector('.navbar');
const heroElement = document.querySelector('.hero');
const heroForm = document.getElementById('hero-form');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const btnMyList = document.getElementById('btn-my-list');
const listCount = document.getElementById('list-count');
const movieModal = document.getElementById('movie-modal');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');

/**
 * Save to localStorage
 */
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Fetch movies from endpoint
 */
async function fetchFromEndpoint(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.results || [];
}

/**
 * Fetch movies by genre
 */
async function fetchByGenre(genreId) {
    const response = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.results || [];
}

/**
 * Fetch movie details
 */
async function fetchMovieDetails(movieId) {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

/**
 * Search movies
 */
async function searchMovies(query) {
    if (!query.trim()) return [];
    const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
}

/**
 * Display error message
 */
function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.classList.add('show');
    setTimeout(() => errorMessageElement.classList.remove('show'), 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    errorMessageElement.style.backgroundColor = '#4caf50';
    errorMessageElement.textContent = message;
    errorMessageElement.classList.add('show');
    setTimeout(() => {
        errorMessageElement.classList.remove('show');
        errorMessageElement.style.backgroundColor = '';
    }, 3000);
}

/**
 * Update list count badge
 */
function updateListCount() {
    listCount.textContent = myList.length;
    listCount.style.display = myList.length > 0 ? 'block' : 'none';
}

/**
 * Check if movie is in list
 */
function isInList(movieId) {
    return myList.some(m => m.id === movieId);
}

/**
 * Add to My List
 */
function addToList(movie) {
    if (!isInList(movie.id)) {
        myList.push({ id: movie.id, title: movie.title || movie.name, poster: movie.poster_path });
        saveToStorage(STORAGE_KEYS.MY_LIST, myList);
        updateListCount();
        showSuccess('Added to My List');
        renderMyList();
    }
}

/**
 * Remove from My List
 */
function removeFromList(movieId) {
    myList = myList.filter(m => m.id !== movieId);
    saveToStorage(STORAGE_KEYS.MY_LIST, myList);
    updateListCount();
    showSuccess('Removed from My List');
    renderMyList();
}

/**
 * Add to Continue Watching
 */
function addToContinueWatching(movie, progress = 0) {
    const existing = continueWatching.findIndex(m => m.id === movie.id);
    const watchData = {
        id: movie.id,
        title: movie.title || movie.name,
        poster: movie.poster_path,
        backdrop: movie.backdrop_path,
        progress: progress,
        timestamp: Date.now()
    };
    
    if (existing >= 0) {
        continueWatching[existing] = watchData;
    } else {
        continueWatching.unshift(watchData);
        if (continueWatching.length > 20) continueWatching.pop();
    }
    
    saveToStorage(STORAGE_KEYS.CONTINUE_WATCHING, continueWatching);
    renderContinueWatching();
}

/**
 * Remove from Continue Watching
 */
function removeFromContinueWatching(movieId) {
    continueWatching = continueWatching.filter(m => m.id !== movieId);
    saveToStorage(STORAGE_KEYS.CONTINUE_WATCHING, continueWatching);
    showSuccess('Removed from Continue Watching');
    renderContinueWatching();
}

/**
 * Create movie card element
 * @param {Object} options - { inContinueWatching: boolean, inMyList: boolean } to show remove buttons
 */
function createMovieCard(movie, showProgress = false, options = {}) {
    const { inContinueWatching = false, inMyList = false } = options;
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.movieId = movie.id;
    
    const posterPath = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/200x300?text=No+Image';
    const backdropPath = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null;
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const title = movie.title || movie.name || 'Untitled';
    
    const progress = showProgress && movie.progress ? movie.progress : 0;
    const inList = isInList(movie.id);
    
    card.innerHTML = `
        <img src="${posterPath}" alt="${title}" class="movie-poster"
             onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
        <div class="movie-overlay">
            <div class="play-button" data-action="play"></div>
        </div>
        ${showProgress && progress > 0 ? `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        ` : ''}
        <div class="movie-info">
            <div class="movie-title">${title}</div>
            <div class="movie-rating"><span class="star">★</span><span>${rating}</span></div>
            <div class="movie-actions">
                ${inMyList ? `
                <button class="action-btn action-btn-remove" data-action="remove-from-list" title="Remove from My List">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
                ` : ''}
                ${inContinueWatching ? `
                <button class="action-btn action-btn-remove" data-action="remove-from-continue" title="Remove from Continue Watching">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
                ` : ''}
                <button class="action-btn ${inList ? 'added' : ''}" data-action="list" title="${inList ? 'Remove from My List' : 'Add to My List'}">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </button>
            </div>
        </div>
    `;
    
    if (backdropPath) card.dataset.backdrop = backdropPath;
    
    // Event listeners
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.action-btn') && !e.target.closest('.play-button')) {
            openMovieModal(movie.id);
        }
    });
    
    card.querySelector('[data-action="play"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        playMovie(movie);
    });
    
    card.querySelector('[data-action="list"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleList(movie);
    });
    
    card.querySelector('[data-action="remove-from-list"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromList(movie.id);
    });
    
    card.querySelector('[data-action="remove-from-continue"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromContinueWatching(movie.id);
    });
    
    return card;
}

/**
 * Toggle movie in list
 */
function toggleList(movie) {
    if (isInList(movie.id)) {
        removeFromList(movie.id);
    } else {
        addToList(movie);
    }
    // Re-render affected cards
    document.querySelectorAll(`[data-movie-id="${movie.id}"]`).forEach(card => {
        const btn = card.querySelector('[data-action="list"]');
        if (btn) {
            btn.classList.toggle('added', isInList(movie.id));
        }
    });
}

/**
 * Play movie (simulate watching)
 */
function playMovie(movie) {
    // Simulate watching - add random progress
    const progress = Math.floor(Math.random() * 80) + 10; // 10-90%
    addToContinueWatching(movie, progress);
    showSuccess(`Playing: ${movie.title || movie.name}`);
}

/**
 * Render movies into container
 * @param {Object} options - { inContinueWatching, inMyList } for remove buttons
 */
function renderMovies(movies, container, showProgress = false, options = {}) {
    if (!container) return;
    container.innerHTML = '';
    if (movies.length === 0) {
        container.innerHTML = '<p style="color:#b3b3b3; padding:20px;">No titles in this row.</p>';
        return;
    }
    movies.forEach(movie => {
        const card = createMovieCard(movie, showProgress, options);
        container.appendChild(card);
    });
}

/**
 * Render Continue Watching
 */
async function renderContinueWatching() {
    const container = document.getElementById('continue-watching-container');
    const section = document.getElementById('continue-watching');
    
    if (continueWatching.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    
    // Fetch full movie data for continue watching items
    const movies = await Promise.all(
        continueWatching.slice(0, 10).map(async (item) => {
            try {
                const movie = await fetchMovieDetails(item.id);
                return { ...movie, progress: item.progress };
            } catch {
                return null;
            }
        })
    );
    
    const validMovies = movies.filter(m => m !== null);
    renderMovies(validMovies, container, true, { inContinueWatching: true });
}

/**
 * Render My List
 */
async function renderMyList() {
    const container = document.getElementById('my-list-container');
    const section = document.getElementById('my-list');
    
    if (myList.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    
    // Fetch full movie data for my list items
    const movies = await Promise.all(
        myList.map(async (item) => {
            try {
                return await fetchMovieDetails(item.id);
            } catch {
                return null;
            }
        })
    );
    
    const validMovies = movies.filter(m => m !== null);
    renderMovies(validMovies, container, false, { inMyList: true });
}

/**
 * Open movie details modal
 */
async function openMovieModal(movieId) {
    try {
        loadingElement.classList.remove('hidden');
        const movie = await fetchMovieDetails(movieId);
        
        const backdropUrl = movie.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : '';
        
        const releaseDate = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';
        const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : 'N/A';
        const inList = isInList(movie.id);
        
        modalBody.innerHTML = `
            ${backdropUrl ? `<img src="${backdropUrl}" alt="${movie.title}" class="modal-backdrop">` : ''}
            <div class="modal-info">
                <h2 class="modal-title">${movie.title}</h2>
                <div class="modal-meta">
                    <span class="modal-meta-item">${releaseDate}</span>
                    <span class="modal-meta-item">${runtime}</span>
                    <span class="modal-meta-item modal-rating">★ ${movie.vote_average?.toFixed(1) || 'N/A'}</span>
                    <span class="modal-meta-item">${genres}</span>
                </div>
                <p class="modal-description">${movie.overview || 'No description available.'}</p>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-primary" data-action="play-modal">
                        <span>▶</span> Play
                    </button>
                    <button class="modal-btn modal-btn-secondary ${inList ? 'added' : ''}" data-action="list-modal">
                        ${inList ? '✓ Remove from My List' : '+ Add to My List'}
                    </button>
                </div>
            </div>
        `;
        
        modalBody.querySelector('[data-action="play-modal"]').addEventListener('click', () => {
            playMovie(movie);
            closeModal();
        });
        
        modalBody.querySelector('[data-action="list-modal"]').addEventListener('click', () => {
            toggleList(movie);
            const btn = modalBody.querySelector('[data-action="list-modal"]');
            btn.textContent = isInList(movie.id) ? '✓ Remove from My List' : '+ Add to My List';
            btn.classList.toggle('added', isInList(movie.id));
        });
        
        movieModal.classList.add('show');
    } catch (error) {
        showError('Failed to load movie details.');
        console.error(error);
    } finally {
        loadingElement.classList.add('hidden');
    }
}

/**
 * Close modal
 */
function closeModal() {
    movieModal.classList.remove('show');
}

/**
 * Set hero backdrop
 */
function setHeroBackdrop(imageUrl) {
    if (imageUrl && heroElement) {
        heroElement.style.backgroundImage =
            `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%), url(${imageUrl})`;
        heroElement.style.backgroundSize = 'cover';
        heroElement.style.backgroundPosition = 'center';
    }
}

/**
 * Initialize scroll buttons
 */
function initScrollButtons() {
    document.querySelectorAll('.movie-row').forEach(row => {
        const container = row.querySelector('.movie-container');
        const leftBtn = row.querySelector('.scroll-left');
        const rightBtn = row.querySelector('.scroll-right');
        
        if (!container || !leftBtn || !rightBtn) return;
        
        leftBtn.addEventListener('click', () => {
            container.scrollBy({ left: -600, behavior: 'smooth' });
        });
        
        rightBtn.addEventListener('click', () => {
            container.scrollBy({ left: 600, behavior: 'smooth' });
        });
    });
}

/**
 * Initialize hero backdrop effect
 */
function initHeroBackdropEffect() {
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const backdrop = card.dataset.backdrop;
            if (backdrop) setHeroBackdrop(backdrop);
        });
    });
}

/**
 * Initialize search
 */
function initSearch() {
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.classList.remove('show');
            return;
        }
        
        searchTimeout = setTimeout(async () => {
            const results = await searchMovies(query);
            displaySearchResults(results);
        }, 300);
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('show');
        }
    });
}

/**
 * Display search results
 */
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        searchResults.classList.add('show');
        return;
    }
    
    results.slice(0, 8).forEach(movie => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        
        const posterPath = movie.poster_path
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : '';
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
        
        item.innerHTML = `
            ${posterPath ? `<img src="${posterPath}" alt="${movie.title}">` : '<div style="width:50px;height:75px;background:#333;"></div>'}
            <div class="search-result-info">
                <div class="search-result-title">${movie.title}</div>
                <div class="search-result-year">${year}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            openMovieModal(movie.id);
            searchInput.value = '';
            searchResults.classList.remove('show');
        });
        
        searchResults.appendChild(item);
    });
    
    searchResults.classList.add('show');
}

/**
 * Initialize navbar scroll
 */
function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    });
}

/**
 * Initialize hero form
 */
function initHeroForm() {
    if (!heroForm) return;
    heroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = heroForm.querySelector('.hero-email');
        const email = input && input.value.trim();
        if (email) {
            showSuccess('Welcome! Start exploring our collection.');
        }
    });
}

/**
 * Load all movie sections
 */
async function loadAllMovies() {
    try {
        loadingElement.classList.remove('hidden');
        
        const results = await Promise.all(SECTIONS.map(s => {
            if (s.endpoint) return fetchFromEndpoint(s.endpoint);
            if (s.genreId != null) return fetchByGenre(s.genreId);
            return Promise.resolve([]);
        }));
        
        SECTIONS.forEach((section, i) => {
            const container = document.getElementById(`${section.id}-container`);
            renderMovies(results[i] || [], container);
        });
        
        const trendingMovies = results[0] || [];
        if (trendingMovies.length > 0 && trendingMovies[0].backdrop_path) {
            setHeroBackdrop(
                `https://image.tmdb.org/t/p/original${trendingMovies[0].backdrop_path}`
            );
        }
        
        // Render Continue Watching and My List
        await renderContinueWatching();
        await renderMyList();
        
        setTimeout(() => {
            initHeroBackdropEffect();
            initScrollButtons();
        }, 100);
    } catch (error) {
        showError('Failed to load movies. Please check your API key and connection.');
        console.error('Error loading movies:', error);
    } finally {
        loadingElement.classList.add('hidden');
    }
}

/**
 * Initialize app
 */
function init() {
    if (API_KEY === 'YOUR_API_KEY') {
        showError('Please set your TMDB API key in script.js');
        loadingElement.classList.add('hidden');
        return;
    }
    
    updateListCount();
    initNavbarScroll();
    initHeroForm();
    initSearch();
    
    modalClose.addEventListener('click', closeModal);
    movieModal.addEventListener('click', (e) => {
        if (e.target === movieModal) closeModal();
    });
    
    btnMyList.addEventListener('click', () => {
        const section = document.getElementById('my-list');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    
    document.querySelector('.logo').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    loadAllMovies();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
