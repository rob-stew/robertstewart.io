const ALLOWED_ORIGIN = /^https:\/\/(www\.)?robertstewart\.io$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        if (request.method !== 'POST' || url.pathname !== '/hit') {
            return new Response(null, { status: 204 });
        }

        const origin = request.headers.get('Origin') || '';
        if (!ALLOWED_ORIGIN.test(origin)) {
            return new Response('forbidden', { status: 403 });
        }

        let body = {};
        try { body = await request.json(); } catch (e) {}

        const cf = request.cf || {};
        const row = [
            new Date().toISOString(),
            cf.asn ?? null,
            cf.asOrganization ?? null,
            cf.country ?? null,
            cf.region ?? null,
            cf.city ?? null,
            String(body.p || '').slice(0, 200),
            String(body.r || '').slice(0, 500),
            (request.headers.get('User-Agent') || '').slice(0, 300),
        ];

        ctx.waitUntil(
            env.DB.prepare(
                'INSERT INTO hits (ts, asn, org, country, region, city, path, referrer, ua) VALUES (?,?,?,?,?,?,?,?,?)'
            ).bind(...row).run()
        );

        return new Response(JSON.stringify({ ok: true, asn: cf.asn, org: cf.asOrganization }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
                'Vary': 'Origin',
            },
        });
    },
};
