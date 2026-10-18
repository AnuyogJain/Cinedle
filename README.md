# Cinedle

Expresso-style daily **movie title** puzzle. Same UTC daily title for everyone, optional login for progress sync, archive calendar, and unlimited mode with genre/country filters.

## Setup

1. `npm install`
2. Copy `env.example` to `.env.local` and set:
   - `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` (required — puzzle pool, auth, sync)
   - `TMDB_API_KEY` (required for `pool:refresh` to 3000+ titles; optional for win posters & unlimited TMDB fallback)
3. `npm run db:push` — apply schema (includes `puzzle_pool_movies`)
4. `npm run pool:refresh` — fill Turso from TMDB Discover (target **3000** eligible titles), or `npm run pool:import` to seed from `data/puzzle-pool.json` first
5. `npm run dev` → [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Grading unit tests |
| `npm run db:push` | Apply schema to Turso |
| `npm run pool:refresh` | Upsert puzzle pool in Turso from TMDB (≥3000 titles) |
| `npm run pool:import` | Import `data/puzzle-pool.json` into Turso (bootstrap) |

## Game rules

- Guess a phrase matching the shown word lengths (letters A–Z).
- **Green** — correct letter & position. **Yellow** — in that word, wrong spot. **Purple** — in the title, different word.
- Answers are multi-word movie titles without `:`, commas, or digits.

## Backup

Logged-in users can export/import CSV progress from **Account** (same pattern as CineSwipe backups).

## Attribution

Movie metadata and posters from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.
