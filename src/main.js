const OMDB_API_KEY = 'ca507dae';
const OMDB_BASE = 'https://www.omdbapi.com/';

const ROW_QUERIES = [
  { title: 'Trending Now', query: 'action' },
  { title: 'Comedy', query: 'comedy' },
  { title: 'Drama', query: 'drama' },
  { title: 'Horror', query: 'horror' },
  { title: 'Sci-Fi', query: 'sci-fi' },
  { title: 'Adventure', query: 'adventure' },
];

async function fetchSearch(query, page = 1) {
  const params = new URLSearchParams({
    apikey: OMDB_API_KEY,
    s: query,
    page: String(page),
    type: 'movie',
  });
  const res = await fetch(`${OMDB_BASE}?${params}`);
  if (!res.ok) throw new Error('OMDB request failed');
  const data = await res.json();
  if (data.Response === 'False') return { Search: [], totalResults: '0' };
  return data;
}

async function fetchMovieById(imdbID) {
  const params = new URLSearchParams({
    apikey: OMDB_API_KEY,
    i: imdbID,
    plot: 'short',
  });
  const res = await fetch(`${OMDB_BASE}?${params}`);
  if (!res.ok) throw new Error('OMDB request failed');
  return res.json();
}

function setHero(movie) {
  const hero = document.getElementById('hero');
  const backdrop = hero.querySelector('.hero-backdrop');
  const titleEl = document.getElementById('heroTitle');
  const descEl = document.getElementById('heroDesc');

  titleEl.textContent = movie.Title || 'Movie';
  descEl.textContent = movie.Plot || '';

  if (movie.Poster && movie.Poster !== 'N/A') {
    backdrop.style.backgroundImage = `url(${movie.Poster})`;
  } else {
    backdrop.style.backgroundImage = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
  }
}

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.dataset.imdbId = movie.imdbID;

  const poster = movie.Poster && movie.Poster !== 'N/A'
    ? `<img class="movie-card-poster" src="${movie.Poster}" alt="${escapeAttr(movie.Title)}" loading="lazy" />`
    : `<div class="movie-card-placeholder">${escapeHtml(movie.Title || 'No poster')}</div>`;

  card.innerHTML = poster;

  card.addEventListener('click', () => {
    fetchMovieById(movie.imdbID).then(setHero);
  });

  return card;
}

function escapeAttr(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.replace(/"/g, '&quot;');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderRow(title, movies) {
  const section = document.createElement('div');
  section.className = 'row';

  const titleEl = document.createElement('h2');
  titleEl.className = 'row-title';
  titleEl.textContent = title;

  const slider = document.createElement('div');
  slider.className = 'row-slider';

  movies.forEach((m) => slider.appendChild(createMovieCard(m)));
  section.appendChild(titleEl);
  section.appendChild(slider);
  return section;
}

async function loadRows() {
  const container = document.getElementById('movieRows');
  let firstMovie = null;

  for (const { title, query } of ROW_QUERIES) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    rowEl.innerHTML = `<h2 class="row-title">${escapeHtml(title)}</h2><div class="row-slider loading"></div>`;
    container.appendChild(rowEl);

    const slider = rowEl.querySelector('.row-slider');
    try {
      const data = await fetchSearch(query);
      const list = data.Search || [];
      slider.classList.remove('loading');
      list.forEach((m) => slider.appendChild(createMovieCard(m)));
      if (!firstMovie && list.length) firstMovie = list[0];
    } catch (e) {
      slider.classList.remove('loading');
      slider.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">Failed to load.</p>';
    }
  }

  if (firstMovie) {
    try {
      const full = await fetchMovieById(firstMovie.imdbID);
      setHero(full);
    } catch {
      setHero({ Title: firstMovie.Title, Plot: '', Poster: firstMovie.Poster });
    }
  } else {
    setHero({ Title: 'Movies', Plot: 'Browse movies below.', Poster: '' });
  }
}

function initHeaderScroll() {
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

initHeaderScroll();
loadRows();
