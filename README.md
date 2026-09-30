# Devils Game Sheet

Live Devils game tracker built on the NHL's public (unofficial) API.

## Deploy
1. Put this folder in a GitHub repo and connect it to a new Netlify site, **or** run `netlify deploy --prod` from this folder with the Netlify CLI.
2. Netlify's drag-and-drop upload won't work, because it doesn't deploy the function in `netlify/functions`.

## Run locally
`npm install -g netlify-cli`, then `netlify dev` in this folder. Opening index.html directly won't work.

## Settings (top of the script in index.html)
- `TEAM`: team to follow (any three-letter code, e.g. "NYR").
- `LIVE_REFRESH_MS`: refresh rate during live games.
- `RECORDS`: hand-kept franchise records; add other teams in the same format.
- `COLORS`: chip colors per team.

## Links
Add `?game=GAMEID` to the URL to open a specific game.
