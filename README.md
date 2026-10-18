# Cinedle

Expresso-style daily **movie title** puzzle. Same UTC daily title for everyone, optional login for progress sync, archive calendar, and unlimited mode with genre/country filters.

## Setup

1. `npm install`
2. Copy `env.example` to `.env.local` and set:
   - `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` (required — assignments, auth, sync)
   - `TMDB_API_KEY` (required — first open of each daily/unlimited puzzle fetches from TMDB)
3. `npm run db:push` — apply schema (`puzzle_assignments`, etc.)
4. `npm run dev` → [http://localhost:3000](http://localhost:3000)

Puzzles are assigned on first load (daily date or unlimited link) and stored in Turso. No bulk pool seed step.

**Fresh deploy:** `npm run db:reset` then `npm run db:push` (wipes users, progress, and legacy pool data).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Grading unit tests |
| `npm run db:push` | Apply schema to Turso |
| `npm run db:reset` | Clear app tables + drop legacy pool table |

## Game rules

- Guess a phrase matching the shown word lengths (letters A–Z).
- **Green** — correct letter & position. **Yellow** — in that word, wrong spot. **Purple** — in the title, different word.
- Puzzle movies use TMDB titles with **letters, spaces, apostrophe, and hyphen only** (no `&`, `:`, commas, digits, etc.).

## Backup

Logged-in users can export/import CSV progress from **Account** (same pattern as CineSwipe backups).

## Attribution

Movie metadata and posters from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.
