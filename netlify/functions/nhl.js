// Proxies requests to the NHL's public web API (api-web.nhle.com) so the
// browser avoids CORS issues. Usage: /.netlify/functions/nhl?path=v1/standings/now
//
// Also proxies a few franchise-record lookups from records.nhl.com:
//   path=records/franchise                       -> list of franchises (ids + abbrevs)
//   path=records/{skaters|goalies}/{franchiseId}/{stat} -> career leader for that stat
const RECORD_ENDPOINTS = { skaters: "skater-career-scoring-regular-season", goalies: "goalie-career-stats" };

function recordsUrl(path) {
  if (path === "records/franchise") return "https://records.nhl.com/site/api/franchise";
  const m = path.match(/^records\/(skaters|goalies)\/(\d+)\/(\w+)$/);
  if (!m) return null;
  const [, kind, franchiseId, stat] = m;
  const filter = `franchiseId=${franchiseId}${kind === "goalies" ? " and gameTypeId=2" : ""}`;
  const sort = JSON.stringify([{ property: stat, direction: "DESC" }]);
  return `https://records.nhl.com/site/api/${RECORD_ENDPOINTS[kind]}?cayenneExp=${encodeURIComponent(filter)}&sort=${encodeURIComponent(sort)}&limit=1`;
}

exports.handler = async (event) => {
  const path = (event.queryStringParameters || {}).path || "";

  let url, maxAge;
  if (path.startsWith("records/")) {
    url = recordsUrl(path);
    maxAge = 86400; // records change slowly
  } else if (/^v1\/[\w\-\/]+$/.test(path)) {
    // Only allow NHL v1 paths (letters, numbers, dashes, slashes)
    url = `https://api-web.nhle.com/${path}`;
    // Live game data gets a short cache; slower-moving data a longer one
    maxAge = /play-by-play|\/score\//.test(path) ? 10 : 300;
  }
  if (!url) return { statusCode: 400, body: JSON.stringify({ error: "Invalid path" }) };

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const body = await res.text();
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${maxAge}` },
      body,
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "Could not reach the NHL API" }) };
  }
};
