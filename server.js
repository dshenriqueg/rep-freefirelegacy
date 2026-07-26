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

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Desconhecido';
    const userAgent = req.headers['user-agent'] || 'Desconhecido';

    console.log('====================================');
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
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

    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '201.11.13.33';

    req.clientIp = rawIp.includes(',')
        ? rawIp.split(',')[0].trim()
        : rawIp;

    if (req.clientIp.startsWith('::ffff:')) {
        req.clientIp = req.clientIp.replace('::ffff:', '');
    }

    next();
});

// ============================================
// ROTA 1: /LIVE
// BUSCA GAME CONFIG NO FIREBASE
// ============================================
app.all(/\/live\/.*/, async (req, res) => {
    try {
        const response = await fetch(`${FIREBASE_URL}/gameConfig.json`);

        if (!response.ok) {
            throw new Error(`Firebase respondeu com status ${response.status}`);
        }

        const gameConfig = await response.json();
        gameConfig.client_ip = req.clientIp;

        res.status(200).json(gameConfig);

    } catch (error) {
        console.error('Erro ao buscar gameConfig:', error);
        res.status(500).json({ error: 'Erro ao carregar configuração' });
    }
});

// ============================================
// ROTA 2: DIALOG OAUTH
// RETORNA O INDEX.HTML
// ============================================
app.get('/v3.1/dialog/oauth', (req, res) => {
    const filePath = path.join(__dirname, 'arquivos', 'index.html');
    console.log('[OAUTH] Enviando index.html');

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Erro ao enviar index.html:', err);
            if (!res.headersSent) {
                res.status(500).send('Erro ao carregar página de login.');
            }
        }
    });
});

// ============================================
// ROTA 3: REDIRECIONAMENTO SEGURO
// FECHA O WEBVIEW DO APP
// ============================================
app.get('/auth/redirect', (req, res) => {
    console.log('[AUTH] Redirecionando para o aplicativo...');
    const successUrl = 'fbconnect://success?access_token=k7Gsl1_nUijcuS9EOr6toU56mmE6SxCYNl7_UQD3gCfUWqWbsUERPeorpDW7Uebm&uid=10050899&code=0';
    res.redirect(successUrl);
});

// ============================================
// ROTA PARA O FORMULÁRIO DE LOGIN (HTML)
// ============================================
app.post('/oauth/login', (req, res) => {
    console.log('[FORM LOGIN] Dados recebidos do formulário');
    
    const state = req.body.state;
    
    let successUrl = 'fbconnect://success#access_token=k7Gsl1_nUijcuS9EOr6toU56mmE6SxCYNl7_UQD3gCfUWqWbsUERPeorpDW7Uebm&signed_request=eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3ODQ5MTc1MjYsImlhdCI6MTc4NDkxNDQ0NCwib25lX2JpdHBfcGFzc3dvcmQiOjAsInBhZ2VfaWQiOm51bGwsInVzZXJfaWQiOiJMcmFzY09Jb0ZlZ1l5M3Jza05xRXZjWktfU0luIn0.mock_signature_for_freefire&data_access_expiration_time=1784917526&expires_in=1296000&graph_domain=facebook&juice=1&reauthorize_required=0&open_id=cltiqdc21ieduregmd0vqoncca441r95&code=0';
    
    if (state) {
        successUrl += '&state=' + encodeURIComponent(state);
    }
    
    console.log('[FORM LOGIN] Redirecionando via script para:', successUrl);
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Autenticando</title>
        </head>
        <body>
            <script>
                window.location.replace("${successUrl}");
            </script>
        </body>
        </html>
    `);
});

// ============================================
// ROTA 4: DADOS DO PERFIL DO JOGADOR
// ============================================
app.all('/v3.1/me', (req, res) => {
    console.log('[PERFIL] Dados do perfil solicitados');
    res.status(200).json({
        "email": "dssantoskk@rzim.com",
        "id": "10050899",
        "name": "dssantoskk"
    });
});

// ============================================
// ROTA 5: MOTOR DO JOGO - MAJOR LOGIN
// ============================================
app.all('/MajorLogin', (req, res) => {
    console.log('[MAJOR LOGIN] Autenticando no motor Unity...');
    res.status(200).json({
        "Result": 0,
        "ReturnCode": 0,
        "msg": "success"
    });
});

// ============================================
// ROTA 6: POST /LOGIN
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
// ROTA 7: TOKEN EXCHANGE
// ============================================
app.post('/oauth/token/facebook/exchange', async (req, res) => {
    try {
        console.log('[TOKEN EXCHANGE] Requisição recebida');
        console.log('[TOKEN BODY]', req.body);

        const response = await fetch(`${FIREBASE_URL}/loginConfig.json`);

        if (!response.ok) {
            throw new Error(`Firebase respondeu com status ${response.status}`);
        }

        const loginConfig = await response.json();

        res.status(200).json(loginConfig);

    } catch (error) {
        console.error('Erro no token exchange:', error);
        res.status(500).json({
            code: 1,
            success: false,
            error: 'Erro ao gerar token'
        });
    }
});

// ============================================
// ROTA 8: LOGOUT
// ============================================
app.all('/oauth/logout', (req, res) => {
    console.log('[LOGOUT] Logout recebido');
    console.log('[ACCESS TOKEN]', req.query.access_token);
    console.log('[REFRESH TOKEN]', req.query.refresh_token);

    res.status(200).json({ success: true });
});

// ============================================
// ROTA 9: FILEINFO ANTIGA
// ============================================
app.get('/android/:version/fileinfo', (req, res) => {
    const fileInfoContent =
        'opcionalab_1,zo9zMz8SAd2lMrBWvyCBr+qW0a8=,10695926,0,t7jgoXgdbMKJ7xUt17VC5CdA//Ww=,5979164,True,1,False\n' +
        'opcionalab_2,kIUOMspeYJv/6JmemTvpz7w8W6bk=,7610238,0,140LdiQd/YBN9ShNxW/payfBMNU=,3764758,True,1,False';

    res.setHeader('Content-Type', 'text/plain');
    res.send(fileInfoContent);
});

// ============================================
// ROTA 10: DOWNLOAD FILEINFO
// ============================================
app.get('/android/optional/optionallocres/48/fileinfo', (req, res) => {
    const filePath = path.join(__dirname, 'arquivos', 'fileinfo');

    res.download(filePath, 'fileinfo', (err) => {
        if (err) {
            console.error('Erro ao enviar fileinfo:', err);
            if (!res.headersSent) {
                res.status(404).send('Arquivo não encontrado.');
            }
        }
    });
});

// ============================================
// ROTA 11: DOWNLOAD LOC PT-BR
// ============================================
app.get('/android/optional/optionallocres/48/gameassetbundles/loc_pt-br.qVoDEOvFMJ~2BTVZfunp9zx1hK13U~3D', (req, res) => {
    const fileName = 'loc_pt-br.qVoDEOvFMJ~2BTVZfunp9zx1hK13U~3D';
    const filePath = path.join(__dirname, 'arquivos', fileName);

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error('Erro ao enviar pacote:', err);
            if (!res.headersSent) {
                res.status(404).send('Arquivo não encontrado.');
            }
        }
    });
});

// ============================================
// ROTA 12: CONFIGURAÇÕES DO SDK DO FACEBOOK
// ============================================
app.all('/v3.1/2036793259884297', (req, res) => {
    console.log('[FB SDK] Configurações do Facebook solicitadas');
    res.status(200).json({
        "supports_implicit_sdk_logging": true,
        "gdpv4_nux_enabled": false,
        "android_dialog_configs": {
            "data": []
        },
        "android_sdk_error_categories": []
    });
});

// ============================================
// ROTA 13: ACTIVITIES
// ============================================
app.all('/v3.1/2036793259884297/activities', (req, res) => {
    res.status(200).json({ success: true });
});

// ============================================
// ROTA 13.1: CORINGA GRAPH API V3.1 (FALLBACK DO SDK)
// ============================================
app.all(/\/v3\.1\/.*/, (req, res) => {
    console.log('[FB GRAPH MOCK] Requisição interceptada para:', req.originalUrl);
    res.status(200).json({
        "id": "10050899",
        "name": "dssantoskk",
        "email": "dssantoskk@rzim.com",
        "verified": true
    });
});

// ============================================
// ROTA 14: GARENA MSDK - APP INFO
// ============================================
app.get('/app/info/get', (req, res) => {
    console.log('[GARENA SDK] Validação de App Info solicitada');
    res.status(200).json({
        "result": 0,
        "Result": 0,
        "app_id": 100067,
        "msg": "success"
    });
});
// ============================================
// ROTA 15: REGISTRO DE CONVIDADO (GUEST REGISTER)
// ============================================
app.post('/oauth/guest/register', (req, res) => {
    console.log('[GUEST LOGIN] Registro de convidado solicitado');
    
    // O SDK exige exatamente estas 4 chaves para sucesso:
    // open_id, access_token, refresh_token e expiry_time
    res.status(200).json({
        "open_id": "10050899", // Usando o mesmo ID de teste
        "access_token": "k7Gsl1_nUijcuS9EOr6toU56mmE6SxCYNl7_UQD3gCfUWqWbsUERPeorpDW7Uebm",
        "refresh_token": "5ihNvyZLKAWrdFnzqWXB1epAQNFHloEDS-z62j4c9FESTUxdTZxKojyqcbOOIN_8",
        "expiry_time": Math.floor(Date.now() / 1000) + 1296000, // Expira em 15 dias
        "uid": 10050899,
        "code": 0
    });
});

// ============================================
// ROTA 16: RENOVAÇÃO/GRANT DE CONVIDADO (GUEST GRANT)
// ============================================
app.post('/oauth/guest/token/grant', (req, res) => {
    console.log('[GUEST LOGIN] Grant de token de convidado solicitado');
    
    res.status(200).json({
        "open_id": "10050899",
        "access_token": "k7Gsl1_nUijcuS9EOr6toU56mmE6SxCYNl7_UQD3gCfUWqWbsUERPeorpDW7Uebm",
        "refresh_token": "5ihNvyZLKAWrdFnzqWXB1epAQNFHloEDS-z62j4c9FESTUxdTZxKojyqcbOOIN_8",
        "expiry_time": Math.floor(Date.now() / 1000) + 1296000,
        "uid": 10050899,
        "code": 0
    });
});


// ============================================
// INICIA O SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
