const express = require('express');
const path = require('path'); // Adicionado para lidar com caminhos de arquivos
const app = express();

// ============================================
// FIREBASE REALTIME DATABASE
// ============================================
const FIREBASE_URL = 'https://fr26xc-default-rtdb.firebaseio.com';

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
// BUSCA O JSON NO FIREBASE
// ============================================
app.all(/\/live\/.*/, async (req, res) => {
    try {
        // Busca o gameConfig no Firebase
        const response = await fetch(
            `${FIREBASE_URL}/gameConfig.json`
        );

        // Verifica se o Firebase respondeu corretamente
        if (!response.ok) {
            throw new Error(
                `Firebase respondeu com status ${response.status}`
            );
        }

        // Converte a resposta para JSON
        const gameConfig = await response.json();

        // Adiciona o IP real do cliente
        gameConfig.client_ip = req.clientIp;

        // Envia a configuração para o jogo
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
// ROTA 2: APP INFO GET (VIA FIREBASE)
// ============================================
app.get('/v3.1/dialog/oauth', async (req, res) => {
    try {
        // Busca o loginConfig no Firebase
        const response = await fetch(`${FIREBASE_URL}/loginConfig.json`);

        // Verifica se o Firebase respondeu corretamente
        if (!response.ok) {
            throw new Error(`Firebase respondeu com status ${response.status}`);
        }

        // Converte a resposta para JSON
        const loginConfigData = await response.json();

        // Envia a configuração para o jogo
        res.json(loginConfigData);

    } catch (error) {
        console.error('Erro ao buscar loginConfig no Firebase:', error);

        res.status(500).json({
            error: 'Erro ao carregar configuração de login'
        });
    }
});

// ============================================
// ROTA 3: FILEINFO (ANTIGA - TEXTO)
// ============================================
app.get('/android/:version/fileinfo', (req, res) => {
    const fileInfoContent =
        "opcionalab_1,zo9zMz8SAd2lMrBWvyCBr+qW0a8=,10695926,0,t7jgoXgdbMKJ7xUt17VC5CdA//Ww=,5979164,True,1,False\n" +
        "opcionalab_2,kIUOMspeYjv/6JmemTvpz7w8W6bk=,7610238,0,140LdiQd/YBN9ShNxW/payfBMNU=,3764758,True,1,False";

    res.setHeader('Content-Type', 'text/plain');
    res.send(fileInfoContent);
});

// ============================================
// ROTA 4: DOWNLOAD DO FILEINFO (NOVA)
// ============================================
app.get('/android/optional/optionallocres/48/fileinfo', (req, res) => {
    const filePath = path.join(__dirname, 'arquivos', 'fileinfo');
    
    res.download(filePath, 'fileinfo', (err) => {
        if (err) {
            console.error('Erro ao enviar fileinfo:', err);
            res.status(404).send('Arquivo não encontrado.');
        }
    });
});

// ============================================
// ROTA 5: DOWNLOAD DO LOC_PT-BR (NOVA)
// ============================================
app.get('/android/optional/optionallocres/48/gameassetbundles/loc_pt-br.qVoDEOvFMJ~2BTVZfunp9zx1hK13U~3D', (req, res) => {
    const fileName = 'loc_pt-br.qVoDEOvFMJ~2BTVZfunp9zx1hK13U~3D';
    const filePath = path.join(__dirname, 'arquivos', fileName);
    
    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error('Erro ao enviar pacote de idioma:', err);
            res.status(404).send('Arquivo não encontrado.');
        }
    });
});

// ============================================
// ROTA 6: ENDPOINT PRINCIPAL - 404
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
        'Nel': '{"report_to":"nel","success_fraction":0.0,"max_age":604800}',
        'Pragma': 'no-cache',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Report-To': '{"group":"cf-nel","success_fraction":0.0,"max_age":604800}',
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
// ROTA 7: ACTIVITIES
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
        'Nel': '{"report_to":"nel","success_fraction":0.0,"max_age":604800}',
        'Pragma': 'no-cache',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Report-To': '{"group":"cf-nel","success_fraction":0.0,"max_age":604800}',
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
