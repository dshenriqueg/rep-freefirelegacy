const express = require('express');
const app = express();

// Trata barras duplas na URL
app.use((req, res, next) => {
    req.url = req.url.replace(/\/+/g, '/');
    next();
});

// Middleware para capturar o IP real do cliente automaticamente
app.use((req, res, next) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '201.11.13.33';
    // Limpa o IP caso venha com múltiplos IPs no x-forwarded-for (pega o primeiro)
    req.clientIp = rawIp.includes(',') ? rawIp.split(',')[0].trim() : rawIp;
    // Remove prefixo IPv6 se houver (ex: ::ffff:192.168.1.1)
    if (req.clientIp.startsWith('::ffff:')) {
        req.clientIp = req.clientIp.replace('::ffff:', '');
    }
    next();
});

// Rota 1: Configuração em JSON (com IP dinâmico adaptado na hora)
app.all(/\/live\/.*/, (req, res) => {
    const gameConfig = {
        "appstore_url": "https://discord.gg/mHN7GPM2j",
        "billboard_msg": "",
        "cdn_url": "https://rep-freefirelegacy.onrender.com/",
        "client_ip": req.clientIp, // Injeta o IP real do usuário dinamicamente
        "code": 0,
        "country_code": "BR",
        "force_to_restart_app": false,
        "gdpr_version": 2,
        "is_firewall_open": false,
        "is_review_server": false,
        "is_server_open": true,
        "maintenance_announcement": "",
        "maintenance_region": "",
        "remote_option_version": "1.25.3",
        "remote_version": "1.25.3",
        "server_url": "https://rep-freefirelegacy.onrender.com/"
    };
    
    res.json(gameConfig);
});

// Rota 2: Resposta de FileInfo exigida pelo cliente do jogo
app.get('/android/:version/fileinfo', (req, res) => {
    const fileInfoContent = 
        "opcionalab_1,zo9zMz8SAd2lMrBWvyCBr+qW0a8=,10695926,0,t7jgoXgdbMKJ7xUt17VC5CdA//Ww=,5979164,True,1,False\n" +
        "opcionalab_2,kIUOMspeYjv/6JmemTvpz7w8W6bk=,7610238,0,140LdiQd/YBN9ShNxW/payfBMNU=,3764758,True,1,False";
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(fileInfoContent);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
