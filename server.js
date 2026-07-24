const express = require('express');
const path = require('path');

const app = express();

// ============================================
// FIREBASE REALTIME DATABASE
// ============================================
const FIREBASE_URL = 'https://fr26xc-default-rtdb.firebaseio.com';

// ============================================
// MIDDLEWARES
// ============================================

app.use(express.json());

// ============================================
// CORS
// ============================================
app.use((req, res, next) => {
    res.header(
        'Access-Control-Allow-Origin',
        'https://login.barbosasmobile.com'
    );

    res.header(
        'Access-Control-Allow-Methods',
        'POST,OPTIONS'
    );

    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    res.header(
        'Access-Control-Allow-Credentials',
        'true'
    );

    res.header(
        'Access-Control-Max-Age',
        '86400'
    );

    // Responde ao preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// ============================================
// REGISTRA TODAS AS REQUISIÇÕES RECEBIDAS
// ============================================
app.use((req, res, next) => {
    const ip =
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        'Desconhecido';

    const userAgent =
        req.headers['user-agent'] ||
        'Desconhecido';

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

    req.clientIp = rawIp.includes(',')
        ? rawIp.split(',')[0].trim()
        : rawIp;

    if (req.clientIp.startsWith('::ffff:')) {
        req.clientIp = req.clientIp.replace('::ffff:', '');
    }

    next();
});

// ============================================
// ROTA 1: CONFIGURAÇÃO /LIVE
// BUSCA O JSON NO FIREBASE
// ============================================
app.all(/\/live\/.*/, async (req, res) => {
    try {
        const response = await fetch(
            `${FIREBASE_URL}/gameConfig.json`
        );

        if (!response.ok) {
            throw new Error(
                `Firebase respondeu com status ${response.status}`
            );
        }

        const gameConfig = await response.json();

        gameConfig.client_ip = req.clientIp;

        res.json(gameConfig);

    } catch (error) {
        console.error(
            'Erro ao buscar configuração no Firebase:',
            error
        );

        res.status(500).json({
            error: 'Erro ao carregar configuração'
        });
    }
});

// ============================================
// ROTA 2: APP INFO GET
// VIA FIREBASE
// ============================================
app.get('/v3.1/dialog/oauth', async (req, res) => {
    try {
        const response = await fetch(
            `${FIREBASE_URL}/loginConfig.json`
        );

        if (!response.ok) {
            throw new Error(
                `Firebase respondeu com status ${response.status}`
            );
        }

        const loginConfigData = await response.json();

        res.json(loginConfigData);

    } catch (error) {
        console.error(
            'Erro ao buscar loginConfig no Firebase:',
            error
        );

        res.status(500).json({
            error: 'Erro ao carregar configuração de login'
        });
    }
});

// ============================================
// ROTA 3: LOGIN
// POST /login
// ============================================
app.post('/login', (req, res) => {

    console.log('====================================');
    console.log('[LOGIN] POST recebido');
    console.log('[LOGIN BODY]', req.body);
    console.log('====================================');

    // Responde exatamente com 204 No Content
    res.status(204).end();
});

// ============================================
// ROTA 4: FILEINFO ANTIGA
// ============================================
app.get('/android/:version/fileinfo', (req, res) => {
    const fileInfoContent =
        "opcionalab_1,zo9zMz8SAd2lMrBWvyCBr+qW0a8=,10695926,0,t7jgoXgdbMKJ7xUt17VC5CdA//Ww=,5979164,True,1,False\n" +
        "opcionalab_2,kIUOMspeYJv/6JmemTvpz7w8W6bk=,7610238,0,140LdiQd/YBN9ShNxW/payfBMNU=,3764758,True,1,False";

    res.setHeader(
        'Content-Type',
        'text/plain'
    );

    res.send(fileInfoContent);
});

// ============================================
// ROTA 5: DOWNLOAD DO FILEINFO
// ============================================
app.get(
    '/android/optional/optionallocres/48/fileinfo',
    (req, res) => {

        const filePath = path.join(
            __dirname,
            'arquivos',
            'fileinfo'
        );

        res.download(
            filePath,
            'fileinfo',
            (err) => {

                if (err) {
                    console.error(
                        'Erro ao enviar fileinfo:',
                        err
                    );

                    if (!res.headersSent) {
                        res.status(404).send(
                            'Arquivo não encontrado.'
                        );
                    }
                }
            }
        );
    }
);

// ============================================
// ROTA 6: DOWNLOAD DO LOC_PT-BR
// ============================================
app.get(
    '/android/optional/optionallocres/48/gameassetbundles/loc_pt-br.qVoDEOvFMJ~2BTVZfunp9zx1hK13U~3D',
    (req, res) => {

        const fileName =
            'loc_pt-br.qVoDEOvFMJ~2BTVZfunp9zx1hK13U~3D';

        const filePath = path.join(
            __dirname,
            'arquivos',
            fileName
        );

        res.download(
            filePath,
            fileName,
            (err) => {

                if (err) {
                    console.error(
                        'Erro ao enviar pacote de idioma:',
                        err
                    );

                    if (!res.headersSent) {
                        res.status(404).send(
                            'Arquivo não encontrado.'
                        );
                    }
                }
            }
        );
    }
);

// ============================================
// ROTA 7: ENDPOINT PRINCIPAL - 404
// ============================================
app.all(
    '/v3.1/2036793259884297',
    (req, res) => {

        res.status(404);

        res.set({
            'alt-svc': 'h3=":443"; ma=86400',
            'Cache-Control':
                'no-store, no-cache, must-revalidate, max-age=0',
            'cf-cache-status': 'DYNAMIC',
            'CF-RAY':
                'a1fe57883c432829-GRU',
            'Content-Type':
                'text/html; charset=utf-8',
            'Pragma':
                'no-cache',
            'Referrer-Policy':
                'strict-origin-when-cross-origin',
            'Server':
                'cloudflare',
            'X-Content-Type-Options':
                'nosniff',
            'X-Frame-Options':
                'DENY',
            'X-XSS-Protection':
                '1; mode=block'
        });

        res.send('Not Found');
    }
);

// ============================================
// ROTA 8: ACTIVITIES
// ============================================
app.all(
    '/v3.1/2036793259884297/activities',
    (req, res) => {

        res.status(200);

        res.set({
            'alt-svc': 'h3=":443"; ma=86400',
            'Cache-Control':
                'no-store, no-cache, must-revalidate, max-age=0',
            'cf-cache-status':
                'DYNAMIC',
            'CF-RAY':
                'a1fe5c6c8dc12829-GRU',
            'Content-Type':
                'application/json',
            'Pragma':
                'no-cache',
            'Referrer-Policy':
                'strict-origin-when-cross-origin',
            'Server':
                'cloudflare',
            'X-Content-Type-Options':
                'nosniff',
            'X-Frame-Options':
                'DENY',
            'X-XSS-Protection':
                '1; mode=block'
        });

        res.json({
            success: true
        });
    }
);

// ============================================
// INICIA O SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Servidor rodando na porta ${PORT}`
    );
});
