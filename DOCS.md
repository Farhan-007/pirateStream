# 🏴‍☠️ Pirate Stream — Developer Documentation

> **Version:** 0.1.0 · **Last Updated:** 2026-05-25 · **Stack:** React 19 + Vite 8 + React Router 7

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Environment Variables](#4-environment-variables)
5. [Getting Started](#5-getting-started)
6. [Routing](#6-routing)
7. [Pages](#7-pages)
   - [Home](#71-home)
   - [MovieDetails](#72-moviedetails)
   - [Watch](#73-watch)
   - [Search](#74-search)
   - [History](#75-history)
8. [Components](#8-components)
   - [Navbar](#81-navbar)
   - [MovieCard](#82-moviecard)
9. [API Utility (`src/utils/api.js`)](#9-api-utility)
10. [Custom Hook — `useWatchHistory`](#10-custom-hook--usewatchhistory)
11. [Styling System](#11-styling-system)
12. [External Services](#12-external-services)
13. [Changelog](#13-changelog)

---

## 1. Project Overview

**Pirate Stream** is a dark-themed movie and TV-series streaming web application. It pulls metadata (posters, ratings, overviews, trailers) from the **TMDB API** and streams content via the embedded **Vidfast.pro** player.

**Key user flows:**
- Browse trending / top-rated / discovered titles on the Home feed.
- Click any card → detailed info page with trailer modal.
- Click "Stream Now" → full-screen streaming page (episode picker for TV shows).
- Search for any movie or series via the Navbar.
- Review recently watched titles in the History page.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router DOM 7 (HashRouter) |
| Icons | Lucide React 1.x |
| Styling | Vanilla CSS (no framework) |
| Metadata API | TMDB v3 (Bearer token auth) |
| Streaming player | Vidfast.pro (embedded iframe) |
| Trailer player | YouTube embed (iframe, autoplay) |
| State persistence | `localStorage` (watch history) |
| Deployment | Netlify (HashRouter used to avoid 404 on direct links) |

---

## 3. Directory Structure

```
movieSite_final_0.1/
├── index.html                  # HTML entry point, sets page title "Pirate Stream"
├── vite.config.js              # Vite config with React plugin
├── eslint.config.js            # ESLint config
├── package.json
├── .env                        # VITE_TMDB_API_TOKEN (not committed)
└── src/
    ├── main.jsx                # React DOM root mount
    ├── App.jsx                 # Root component — Router, Navbar, routes, Footer
    ├── App.css                 # App-level layout styles
    ├── index.css               # Global design system (tokens, utilities, animations)
    ├── assets/                 # Static assets (images, SVGs)
    ├── components/
    │   ├── Navbar.jsx          # Top navigation bar with search
    │   ├── Navbar.css
    │   ├── MovieCard.jsx       # Reusable media card with poster + rating
    │   └── MovieCard.css
    ├── pages/
    │   ├── Home.jsx            # Landing page — hero carousel + 3 content sections
    │   ├── Home.css
    │   ├── MovieDetails.jsx    # Media info page + trailer modal
    │   ├── MovieDetails.css
    │   ├── Watch.jsx           # Streaming page — iframe player + TV episode sidebar
    │   ├── Watch.css
    │   ├── Search.jsx          # Search results page
    │   ├── Search.css
    │   ├── History.jsx         # Watch history from localStorage
    │   └── History.css
    ├── hooks/
    │   └── useWatchHistory.js  # Custom hook for localStorage-backed watch history
    └── utils/
        └── api.js              # All TMDB fetch functions + image URL helper
```

---

## 4. Environment Variables

Create a `.env` file at the project root:

```env
VITE_TMDB_API_TOKEN=your_tmdb_bearer_token_here
```

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

The token is a TMDB **Read Access Token (v4 auth)**, used as a Bearer header — _not_ a query-param API key.

---

## 5. Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 6. Routing

The app uses **`HashRouter`** (chosen to prevent Netlify 404s on direct URL access for SPA routes).

| Path | Component | Description |
|---|---|---|
| `/` | `Home` | Landing page with hero carousel and content grids |
| `/:type/:id` | `MovieDetails` | Details page. `type` = `movie` or `tv` |
| `/watch/:type/:id` | `Watch` | Streaming page with Vidfast.pro player |
| `/history` | `History` | User's local watch history |
| `/search?q=...` | `Search` | Search results (query via URL param) |

### Route params

- **`:type`** — `"movie"` or `"tv"`. Drives which TMDB endpoint and Vidfast URL pattern to use.
- **`:id`** — TMDB numeric ID for the title.

---

## 7. Pages

### 7.1 Home

**File:** `src/pages/Home.jsx`

Fetches three data sets in parallel on mount:

| Data | TMDB Endpoint | Displayed |
|---|---|---|
| Trending | `/trending/all/day` | Hero carousel (top 10) + "Trending Now" grid |
| Top Rated | `/movie/top_rated` | "Top Rated" grid (10 items) |
| Discover | `/discover/movie?sort_by=popularity.desc` | "Discover Movies" grid (20 items) |

**Hero Carousel:**
- Auto-advances every **5 seconds** via `setInterval`.
- Users can jump to any slide via dot indicator buttons.
- Each slide shows the backdrop image with a gradient overlay, ranking badge, title, overview, and a "Watch Now" `<Link>`.

**Loading state:** Renders a full skeleton UI (matching the real layout dimensions) until all three API calls resolve.

---

### 7.2 MovieDetails

**File:** `src/pages/MovieDetails.jsx`

Route: `/:type/:id`

**On mount:**
1. Calls `fetchMovieDetails(id, type)` — returns data including `credits`, `similar`, and `videos`.
2. Finds the best YouTube trailer from `videos.results` (prefers `type === 'Trailer'`).
3. Calls `addToHistory()` to persist this title in localStorage.
4. Scrolls to top of page.

**UI sections:**
- **Backdrop** — full-width blurred hero image.
- **Details grid** — poster image (left) + info column (right):
  - Title, star rating, release year, runtime badges.
  - Genre pills.
  - Storyline overview.
  - **"Stream Now"** button → navigates to `/watch/:type/:id`.
  - **"Watch Trailer"** button → opens trailer modal (only shown if a YouTube trailer exists).
- **Similar titles** — `MovieCard` grid (up to 10).
- **Trailer Modal** — YouTube embed in a centered overlay. Closes on:
  - Click outside the modal box.
  - Click the ✕ button.
  - Press `Escape`.
  - Body scroll is locked while modal is open.

---

### 7.3 Watch

**File:** `src/pages/Watch.jsx`

Route: `/watch/:type/:id`

The core streaming experience.

**Player URL construction:**

| Media type | Vidfast URL |
|---|---|
| Movie | `https://vidfast.pro/movie/{id}` |
| TV Series | `https://vidfast.pro/tv/{id}/{season}/{episode}` |

**Layout — two-column (desktop) / single-column (mobile):**

| Column | Contents |
|---|---|
| **Sidebar** (TV only, 360px wide on desktop) | Season pill buttons + scrollable episode list |
| **Main** | Back button, `<iframe>` player, info bar (title, badges, overview) |

**TV Show flow:**
1. On load, auto-selects the first non-special season (`season_number > 0`).
2. When a season is selected, calls `fetchSeasonDetails()` and populates the episode list.
3. Clicking an episode sets `selectedEpisode`, increments `playerKey` (forces iframe remount), and scrolls to top.

**`playerKey`:** An integer counter used as the iframe's `key` prop. Incrementing it forces React to unmount/remount the iframe, effectively changing the stream URL without stale content.

**Mobile ordering (CSS `order` property):** Back button → player → episode list → season pills → description.

---

### 7.4 Search

**File:** `src/pages/Search.jsx`

Route: `/search?q=<query>`

Reads the `q` URL search parameter and calls `searchMovies(query)` (TMDB `/search/multi`). Filters out `media_type === 'person'` results so only movies and TV shows appear.

States:
- **Loading** — skeleton grid of 12 cards.
- **Empty** — illustrated empty state with prompt to try another term.
- **Results** — `MovieCard` grid.

---

### 7.5 History

**File:** `src/pages/History.jsx`

Route: `/history`

Reads watch history from the `useWatchHistory` hook (localStorage). Each card is wrapped in a `div` with a floating **trash icon button** to remove that single entry. A "Clear All" button clears the entire list.

Shows an illustrated empty state when history is empty.

---

## 8. Components

### 8.1 Navbar

**File:** `src/components/Navbar.jsx`

- **Brand logo** — Skull icon + "Pirate Stream" gradient text, links to `/`.
- **Nav links** — Home, History.
- **Search form** — controlled `<input>`, on submit navigates to `/search?q=<term>` and clears the field.
- **Mobile hamburger** — `Menu`/`X` toggle that shows/hides `.nav-links`.

### 8.2 MovieCard

**File:** `src/components/MovieCard.jsx`

Reusable card used across Home, MovieDetails (similar), Search, and History.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `movie` | Object | TMDB media object |

**Media type detection:** Uses `movie.media_type` if available; falls back to checking `movie.first_air_date` (TV shows have this field).

**Renders:** Poster image (lazy-loaded `w500`), hover play overlay, title, year, and star rating.

---

## 9. API Utility

**File:** `src/utils/api.js`

All TMDB calls use a shared `options` object with the Bearer token header.

| Export | Signature | TMDB endpoint |
|---|---|---|
| `fetchTrending` | `() → Promise` | `GET /trending/all/day` |
| `fetchTopRated` | `() → Promise` | `GET /movie/top_rated` |
| `fetchDiscover` | `() → Promise` | `GET /discover/movie?sort_by=popularity.desc` |
| `fetchMovieDetails` | `(id, type?) → Promise` | `GET /{type}/{id}?append_to_response=credits,similar,videos` |
| `fetchSeasonDetails` | `(seriesId, seasonNumber) → Promise` | `GET /tv/{seriesId}/season/{seasonNumber}` |
| `searchMovies` | `(query) → Promise` | `GET /search/multi?query={query}` |
| `getImageUrl` | `(path, size?) → string` | Returns `https://image.tmdb.org/t/p/{size}{path}` |

**`getImageUrl` defaults:**
- `size` defaults to `"original"`.
- Returns a placeholder URL if `path` is falsy.

---

## 10. Custom Hook — `useWatchHistory`

**File:** `src/hooks/useWatchHistory.js`

Manages watch history in `localStorage` under the key `moviesite_history`.

**Returns:**

| Name | Type | Description |
|---|---|---|
| `history` | `Array` | Ordered list of watched media objects |
| `addToHistory` | `(movie) → void` | Prepends item; de-duplicates by `id`; caps at 50 entries |
| `removeFromHistory` | `(id) → void` | Removes a single entry by `id` |
| `clearHistory` | `() → void` | Removes all entries and clears localStorage key |

**History item shape** (set in `MovieDetails.jsx`):

```js
{
  id: number,
  title: string,
  poster_path: string | null,
  release_date: string,       // "YYYY-MM-DD"
  vote_average: number,
  media_type: "movie" | "tv"
}
```

---

## 11. Styling System

**Global file:** `src/index.css`

The design system follows a **One Piece / pirate** aesthetic with a dark, rich palette.

Key CSS custom properties (design tokens) defined on `:root`:

| Token | Purpose |
|---|---|
| `--bg-dark` | Primary dark background |
| `--primary` | Accent / brand color |
| `--text-primary` | Main text |
| `--text-secondary` | Muted text |

**Utility classes used throughout:**

| Class | Effect |
|---|---|
| `.glass` | Frosted-glass backdrop-filter card |
| `.glass-card` | Card variant of glass effect |
| `.container` | Max-width centered layout wrapper |
| `.gradient-text` | Brand gradient applied to text |
| `.animate-fade-in` | CSS fade-in animation on mount |
| `.btn` | Base button style |
| `.btn-primary` | Primary CTA button |
| `.btn-glass` | Transparent glass button |
| `.sk` / `.sk-card` / `.sk-round` | Skeleton shimmer elements |

Each page/component has its own co-located `.css` file for scoped styles.

---

## 12. External Services

### TMDB API
- Base URL: `https://api.themoviedb.org/3`
- Auth: Bearer token via `Authorization` header
- Image CDN: `https://image.tmdb.org/t/p/{size}{path}`
- Docs: https://developer.themoviedb.org/reference/intro/getting-started

### Vidfast.pro (streaming player)
- Movie embed: `https://vidfast.pro/movie/{tmdb_id}`
- TV embed: `https://vidfast.pro/tv/{tmdb_id}/{season}/{episode}`
- Loaded inside a sandboxed `<iframe>` with `allowFullScreen` and `allow="autoplay; fullscreen"`.

### YouTube (trailers)
- Embed URL: `https://www.youtube.com/embed/{videoKey}?autoplay=1&rel=0`
- Only shown when TMDB returns a `site === 'YouTube'` video in the `videos.results` array.

---

## 13. Changelog

| Date | Version | Summary |
|---|---|---|
| 2026-05-25 | 0.1.0 | Initial documentation written |
| 2026-05-24 | — | Watch page: TV episode sidebar, season pills, responsive layout |
| 2026-05-24 | — | MovieDetails: YouTube trailer modal with Escape/overlay close |
| 2026-05-13 | — | One Piece dark theme applied globally |
| 2026-05-13 | — | Switched to HashRouter to fix Netlify SPA 404s; custom Jolly Roger favicon |
| 2026-05-13 | — | Renamed site to "Pirate Stream" |
| 2026-05-13 | — | VidFast integration: movie vs. TV URL differentiation |
| 2026-05-13 | — | Hero section converted to auto-advancing carousel |
| 2026-05-13 | — | TMDB API refactored to Bearer token auth |
