// Proxies requests to the NHL's public web API (api-web.nhle.com) so the
// browser avoids CORS issues. Usage: /.netlify/functions/nhl?path=v1/standings/now
exports.handler = async (event) => {
  const path = (event.queryStringParameters || {}).path || "";

  // Only allow NHL v1 paths (letters, numbers, dashes, slashes)
  if (!/^v1\/[\w\-\/]+$/.test(path)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid path" }) };
  }

  // Live game data gets a short cache; slower-moving data a longer one
  const live = /play-by-play|\/score\//.test(path);
  const maxAge = live ? 10 : 300;

  try {
    const res = await fetch(`https://api-web.nhle.com/${path}`, { headers: { Accept: "application/json" } });
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
