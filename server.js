const express = require('express');
const path = require('path');

const app = express();

// ============================================
// FIREBASE REALTIME DATABASE
// ============================================
const FIREBASE_URL =
    'https://fr26xc-default-rtdb.firebaseio.com';

// ============================================
// MIDDLEWARES
// ============================================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

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
        'GET,POST,OPTIONS'
    );

    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );

    res.header(
        'Access-Control-Allow-Credentials',
        'true'
    );

    res.header(
        'Access-Control-Max-Age',
        '86400'
    );

    // ========================================
    // PREFLIGHT CORS
    // ========================================
    if (req.method === 'OPTIONS') {

        console.log('[CORS] OPTIONS recebido');

        return res.status(204).end();
    }

    next();
});

// ============================================
// REGISTRA TODAS AS REQUISIÇÕES
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
    console.log(
        `[REQUEST] ${req.method} ${req.originalUrl}`
    );
    console.log(`[IP] ${ip}`);
    console.log(`[USER-AGENT] ${userAgent}`);

    if (req.body && Object.keys(req.body).length > 0) {
        console.log('[BODY]', req.body);
    }

    console.log('====================================');

    next();
});

// ============================================
// TRATA BARRAS DUPLAS
// ============================================
app.use((req, res, next) => {

    req.url = req.url.replace(/\/+/g, '/');

    next();
});

// ============================================
// CAPTURA IP REAL
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
        req.clientIp =
            req.clientIp.replace('::ffff:', '');
    }

    next();
});

// ============================================
// ROTA 1: /LIVE
// BUSCA GAME CONFIG NO FIREBASE
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

        const gameConfig =
            await response.json();

        gameConfig.client_ip =
            req.clientIp;

        res.status(200).json(
            gameConfig
        );

    } catch (error) {

        console.error(
            'Erro ao buscar gameConfig:',
            error
        );

        res.status(500).json({
            error:
                'Erro ao carregar configuração'
        });
    }
});

// ============================================
// ROTA 2: DIALOG OAUTH
// RETORNA O INDEX.HTML
// ============================================
app.get('/v3.1/dialog/oauth',
    (req, res) => {

        const filePath = path.join(
            __dirname,
            'arquivos',
            'index.html'
        );

        console.log(
            '[OAUTH] Enviando index.html'
        );

        res.sendFile(
            filePath,
            (err) => {

                if (err) {

                    console.error(
                        'Erro ao enviar index.html:',
                        err
                    );

                    if (!res.headersSent) {

                        res.status(500).send(
                            'Erro ao carregar página de login.'
                        );
                    }
                }
            }
        );
    }
);

// ============================================
// ROTA 3: OPTIONS /LOGIN
// ============================================
// O middleware CORS acima já responde
// automaticamente com 204.
//
// OPTIONS /login
// -> 204 No Content
//
// O POST acontece depois.
// ============================================

// ============================================
// ROTA 4: POST /LOGIN
// RETORNA RESPOSTA PARA O CLIENTE
// ============================================
app.post('/login', (req, res) => {
    res.status(200).json({
        "access_token": "k7Gsl1_nUijcuS9EOr6toU56mmE6SxCYNl7_UQD3gCfUWqWbsUERPeorpDW7Uebm",
        "code": 0,
        "create_time": 1784914044,
        "expires_in": 1296000,
        "expiry_time": 1784917526,
        "main_active_platform": 3,
        "open_id": "cltiqdc21ieduregmd0vqoncca441r95",
        "platform": 3,
        "refresh_expiry_time": 1784917526,
        "refresh_token": "5ihNvyZLKAWrdFnzqWXB1epAQNFHloEDS-z62j4c9FESTUxdTZxKojyqcbOOIN_8",
        "scope": [
            "get_user_info",
            "get_friends",
            "payment",
            "send_request"
        ],
        "token_type": "Bearer",
        "uid": 10050899
    });
});
// ============================================
// ROTA 5: TOKEN EXCHANGE
// ============================================
app.post(
    '/oauth/token/facebook/exchange',
    async (req, res) => {

        try {

            console.log(
                '[TOKEN EXCHANGE] Requisição recebida'
            );

            console.log(
                '[TOKEN BODY]',
                req.body
            );

            const response =
                await fetch(
                    `${FIREBASE_URL}/loginConfig.json`
                );

            if (!response.ok) {

                throw new Error(
                    `Firebase respondeu com status ${response.status}`
                );
            }

            const loginConfig =
                await response.json();

            // =================================
            // RETORNA O LOGIN CONFIG
            // =================================
            res.status(200).json(
                loginConfig
            );

        } catch (error) {

            console.error(
                'Erro no token exchange:',
                error
            );

            res.status(500).json({

                code: 1,

                success: false,

                error:
                    'Erro ao gerar token'

            });
        }
    }
);

// ============================================
// ROTA 6: LOGOUT
// ============================================
app.all(
    '/oauth/logout',
    (req, res) => {

        console.log(
            '[LOGOUT] Logout recebido'
        );

        console.log(
            '[ACCESS TOKEN]',
            req.query.access_token
        );

        console.log(
            '[REFRESH TOKEN]',
            req.query.refresh_token
        );

        res.status(200).json({

            success: true

        });
    }
);

// ============================================
// ROTA 7: FILEINFO ANTIGA
// ============================================
app.get(
    '/android/:version/fileinfo',
    (req, res) => {

        const fileInfoContent =

            'opcionalab_1,zo9zMz8SAd2lMrBWvyCBr+qW0a8=,10695926,0,t7jgoXgdbMKJ7xUt17VC5CdA//Ww=,5979164,True,1,False\n' +

            'opcionalab_2,kIUOMspeYJv/6JmemTvpz7w8W6bk=,7610238,0,140LdiQd/YBN9ShNxW/payfBMNU=,3764758,True,1,False';

        res.setHeader(
            'Content-Type',
            'text/plain'
        );

        res.send(
            fileInfoContent
        );
    }
);

// ============================================
// ROTA 8: DOWNLOAD FILEINFO
// ============================================
app.get(
    '/android/optional/optionallocres/48/fileinfo',
    (req, res) => {

        const filePath =
            path.join(
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

                        res.status(404)
                            .send(
                                'Arquivo não encontrado.'
                            );
                    }
                }
            }
        );
    }
);

// ============================================
// ROTA 9: DOWNLOAD LOC PT-BR
// ============================================
app.get(
    '/android/optional/optionallocres/48/gameassetbundles/loc_pt-br.qVoDEOvFMJ~2BTVZfunp9zx1hK13U~3D',
    (req, res) => {

        const fileName =
            'loc_pt-br.qVoDEOvFMJ~2BTVZfunp9zx1hK13U~3D';

        const filePath =
            path.join(
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
                        'Erro ao enviar pacote:',
                        err
                    );

                    if (!res.headersSent) {

                        res.status(404)
                            .send(
                                'Arquivo não encontrado.'
                            );
                    }
                }
            }
        );
    }
);

// ============================================
// ROTA 10: ENDPOINT PRINCIPAL
// ============================================
app.all(
    '/v3.1/2036793259884297',
    (req, res) => {

        res.status(404);

        res.set({
            'Cache-Control':
                'no-store, no-cache, must-revalidate, max-age=0',

            'Content-Type':
                'text/html; charset=utf-8',

            'X-Content-Type-Options':
                'nosniff',

            'X-Frame-Options':
                'DENY'
        });

        res.send(
            'Not Found'
        );
    }
);

// ============================================
// ROTA 11: ACTIVITIES
// ============================================
app.all(
    '/v3.1/2036793259884297/activities',
    (req, res) => {

        res.status(200);

        res.json({

            success: true

        });
    }
);

// ============================================
// INICIA O SERVIDOR
// ============================================
const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor rodando na porta ${PORT}`
        );

    }
);
