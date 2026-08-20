# rs-beacon

Cloudflare Worker + D1 that logs page hits from robertstewart.io with the
visitor's ASN/organization (no raw IP). Page-side beacon: `js/rs.js`.

## One-time setup

    cd worker
    npx wrangler login
    npx wrangler d1 create rs-beacon          # paste database_id into wrangler.toml
    npx wrangler d1 execute rs-beacon --remote --file schema.sql
    npx wrangler deploy                       # paste the workers.dev URL into js/rs.js

## Queries

Run from `worker/`. Copy a whole line; the SQL goes inside the quotes.

Recent hits:

    npx wrangler d1 execute rs-beacon --remote --command "SELECT id, substr(ts,1,16) ts, org, city, region, path, referrer FROM hits ORDER BY id DESC LIMIT 50"

Top orgs, last 7 days:

    npx wrangler d1 execute rs-beacon --remote --command "SELECT org, asn, COUNT(*) n FROM hits WHERE ts > datetime('now','-7 days') GROUP BY org, asn ORDER BY n DESC LIMIT 30"

University / college networks:

    npx wrangler d1 execute rs-beacon --remote --command "SELECT substr(ts,1,16) ts, org, city, region, country, path, referrer FROM hits WHERE org LIKE '%univ%' OR org LIKE '%college%' OR org LIKE '%school%' OR org LIKE '%institute%' OR org LIKE '%.edu%' ORDER BY ts DESC LIMIT 100"

Hits per day:

    npx wrangler d1 execute rs-beacon --remote --command "SELECT substr(ts,1,10) d, COUNT(*) n FROM hits GROUP BY d ORDER BY d DESC"

Delete your own test rows:

    npx wrangler d1 execute rs-beacon --remote --command "DELETE FROM hits WHERE id IN (1,2,3)"

Notes: `ts` is UTC. Split-tunnel VPN users show as their home ISP; only on-campus
or full-tunnel traffic shows the university ASN. Add `--json` for machine-readable
output.
