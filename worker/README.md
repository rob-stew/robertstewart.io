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

    npx wrangler d1 execute rs-beacon --remote --command "<sql>"

Top orgs, last 7 days:

    SELECT org, asn, COUNT(*) n FROM hits
    WHERE ts > datetime('now', '-7 days')
    GROUP BY org, asn ORDER BY n DESC LIMIT 30;

University / college networks:

    SELECT ts, org, city, region, country, path, referrer FROM hits
    WHERE org LIKE '%univ%' OR org LIKE '%college%' OR org LIKE '%school%'
       OR org LIKE '%institute%' OR org LIKE '%.edu%'
    ORDER BY ts DESC LIMIT 100;

Hits per day:

    SELECT substr(ts,1,10) d, COUNT(*) n FROM hits GROUP BY d ORDER BY d DESC;
