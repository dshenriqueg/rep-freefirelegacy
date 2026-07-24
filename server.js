const express = require('express');
const app = express();

// ============================================
// REGISTRA TODAS AS REQUISIÇÕES RECEBIDAS
// ============================================
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Desconhecido';

    console.log('====================================');
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    console.log(`[IP] ${ip}`);
    console.log(`[USER-AGENT] ${userAgent}`);
    console.log('====================================');

    next();
});

// ============================================
// TRATA BARRAS DUPLAS NA URL
// ============================================
app.use((req, res, next) => {
    req.url = req.url.replace(/\/+/g, '/');
    next();
});

// ============================================
// CAPTURA O IP REAL DO CLIENTE
// ============================================
app.use((req, res, next) => {
    const rawIp =
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        '201.11.13.33';

    // Pega o primeiro IP caso existam múltiplos
    req.clientIp = rawIp.includes(',')
        ? rawIp.split(',')[0].trim()
        : rawIp;

    // Remove prefixo IPv6
    if (req.clientIp.startsWith('::ffff:')) {
        req.clientIp = req.clientIp.replace('::ffff:', '');
    }

    next();
});

// ============================================
// ROTA 1: CONFIGURAÇÃO /LIVE
// ============================================
app.all(/\/live\/.*/, (req, res) => {
    const gameConfig = {
        "appstore_url": "https://discord.gg/mHN7GPM2j",
        "billboard_msg": "",
        "cdn_url": "https://rep-freefirelegacy.onrender.com/",
        "client_ip": req.clientIp,
        "code": 0,
        "country_code": "BR",
        "force_to_restart_app": false,
        "gdpr_version": 2,
        "is_firewall_open": false,
        "is_review_server": false,
        "is_server_open": true,
        "maintenance_announcement": "",
        "maintenance_region": "",
        "remote_option_version": "1.34.0",
        "remote_version": "1.34.0",
        "server_url": "https://rep-freefirelegacy.onrender.com/"
    };

    res.json(gameConfig);
});

// ============================================
// ROTA 2: FILEINFO
// ============================================
app.get('/android/:version/fileinfo', (req, res) => {
    const fileInfoContent =
        "opcionalab_1,zo9zMz8SAd2lMrBWvyCBr+qW0a8=,10695926,0,t7jgoXgdbMKJ7xUt17VC5CdA//Ww=,5979164,True,1,False\n" +
        "opcionalab_2,kIUOMspeYJv/6JmemTvpz7w8W6bk=,7610238,0,140LdiQd/YBN9ShNxW/payfBMNU=,3764758,True,1,False";

    res.setHeader('Content-Type', 'text/plain');
    res.send(fileInfoContent);
});

// ============================================
// ROTA 3: ENDPOINT PRINCIPAL - 404
// ============================================
app.all('/v3.1/2036793259884297', (req, res) => {
    res.status(404);

    res.set({
        'alt-svc': 'h3=":443"; ma=86400',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'cf-cache-status': 'DYNAMIC',
        'CF-RAY': 'a1fe57883c432829-GRU',
        'Connection': 'keep-alive',
        'Content-Type': 'text/html; charset=utf-8',
        'Date': 'Thu, 23 Jul 2026 23:07:32 GMT',
        'Nel': '{"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}',
        'Pragma': 'no-cache',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Report-To': '{"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=jme3QLs%2Fv7Ky2vVUatonBLheAw%2BjlsQz9ih3lAP%2Btuo7c9L5hwARuzVi7HN5VVcCo841mhAJ2wQtVD06MGdCCxXhgTMJQzsL7QPiJAvySV0vvi3zGl%2BNHCq3Fn%2FGac5ppkU5AQWNivvRhBs%3D"}]}',
        'Server': 'cloudflare',
        'Server-Timing': 'cfCacheStatus;desc="DYNAMIC"',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    });

    res.send('Not Found');
});

// ============================================
// ROTA 4: ACTIVITIES
// ============================================
app.all('/v3.1/2036793259884297/activities', (req, res) => {
    res.status(200);

    res.set({
        'alt-svc': 'h3=":443"; ma=86400',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'cf-cache-status': 'DYNAMIC',
        'CF-RAY': 'a1fe5c6c8dc12829-GRU',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Date': 'Thu, 23 Jul 2026 23:10:52 GMT',
        'Nel': '{"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}',
        'Pragma': 'no-cache',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Report-To': '{"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=%2FfFMVSIHOICYKdC5ERg9wqz1SEFLjx3CzmF%2BX6Zcq7Hc4rIzqi%2F1YNk6MLorY%2F71X2zUH2jvdGkERxmJZb31dKk8RjEoYWRbibSfx7k1EdqzqYwXNkQyZadlKrQDs6DyBwUDKuDiUeWAlic%3D"}]}',
        'Server': 'cloudflare',
        'Server-Timing': 'cfCacheStatus;desc="DYNAMIC"',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    });

    res.json({
        success: true
    });
});

// ============================================
// INICIA O SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
