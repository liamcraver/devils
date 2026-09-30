# Devils Game Sheet

Live New Jersey Devils game tracker that replaces a manual per-game Google Sheet.
Live at https://devils-stats.netlify.app, auto-deploys from this repo via Netlify.

## Stack
- `index.html`: the whole app. Vanilla JS, HTML, and CSS in one file, no build step, no framework.
- `netlify/functions/nhl.js`: proxy to `https://api-web.nhle.com/` (avoids CORS). Called as
  `/.netlify/functions/nhl?path=v1/...`. Only `v1/` paths are allowed. Cache: 10s for play-by-play/score, 300s otherwise.
  Also proxies records.nhl.com via `path=records/franchise` and `path=records/{skaters|goalies}/{franchiseId}/{stat}`
  (career leader for one stat; the function builds the cayenneExp/sort query). Cache: 1 day.
- `netlify.toml`: publish `.`, functions in `netlify/functions`.
- `tests/harness.js`: smoke test that runs the page script against mock API responses.

## Commands
- `netlify dev`: run locally with the function (opening index.html directly will NOT work).
- `node tests/harness.js`: smoke test. Run after every change to index.html.
  Node isn't installed on this Mac; use `ELECTRON_RUN_AS_NODE=1 "/Applications/Visual Studio Code.app/Contents/MacOS/Electron" tests/harness.js`.
- Deploy: commit and push to main; Netlify redeploys. Drag-and-drop deploys skip the function, so never use them.

## NHL API endpoints used (unofficial, undocumented; reference: github.com/Zmalski/NHL-API-Reference)
- `v1/club-schedule-season/NJD/now`: season schedule, game picker, series, last/next game
- `v1/gamecenter/{id}/play-by-play`: all live-tracker data (plays, rosterSpots, gameState, clock)
- `v1/gamecenter/{id}/boxscore`: last game and last meeting recaps
- `v1/standings/now`: standings row
- `v1/club-stats/{TEAM}/{season}/2`: stat leaders and goalies (falls back to previous season if empty)
- records.nhl.com `franchise`, `skater-career-scoring-regular-season`, `goalie-career-stats`: franchise career leaders for both teams

## Key logic
- Default game: `?game=` URL param, else a live game, else today's, else next upcoming, else last played.
- Refresh: every 20s when LIVE/CRIT; every 60s within 3h before puck drop.
- `creditTeam()` decides which team an event counts for (faceoff winner, hitter, blocker, shooter, penalized player). Uses the player's roster team, falling back to `eventOwnerTeamId`.
- "Whistle in first minute" = a `stoppage`, `goal`, or `penalty` event before 01:00 of the period.
- "Shots" = `shot-on-goal` + `goal`. Shootout plays (periodType SO) are excluded from all stats.
- Franchise records: career leaders (points, goals, assists, GP, goalie wins, shutouts) load live via `franchiseRecords()`.
  Hand-kept `RECORDS` lines fill in labels the live lookup doesn't cover (single-season records) and are the fallback if it fails.
- Last game recap shows goals, assists, and points (boxscore `points`, falling back to goals + assists).

## Known risks
- Field names inside responses were written from memory, not verified against live data. If a panel is blank, check these first:
  standings (`teamAbbrev.default`, `pointPctg`, `regulationPlusOtWins`, `l10Wins`, `streakCode`),
  club-stats (`avgTimeOnIcePerGame` in seconds, `goalsAgainstAverage`, `savePercentage`),
  boxscore (`playerByGameStats.{homeTeam,awayTeam}.{forwards,defense,goalies}`, `sog`, `toi`, goalie `saves` / `saveShotsAgainst`).
- The API can change without notice. When debugging, fetch the real endpoint through the proxy and compare field names.
- When fixing a field name, update the mocks in `tests/harness.js` to match the real response too.

## Conventions
- Keep it a single-file app with no build step unless there's a strong reason.
- Escape all API text with `esc()` before inserting into HTML.
- User-editable settings (TEAM, refresh rates, RECORDS, COLORS) stay at the top of the script.
- Mobile-first: most use is on a phone during games.
