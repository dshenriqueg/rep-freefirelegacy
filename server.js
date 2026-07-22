const express = require('express');
const app = express();

app.use((req, res, next) => {
    req.url = req.url.replace(/\/+/g, '/');
    next();
});

// JSON de configuração direto na resposta (sem delay, sem cache)
const gameConfig = {
    "appstore_url": "https://discord.gg/barbosaproject",
        "billboard_msg": "",
        "cdn_url": "https://rep-freefirelegacy.onrender.com/",
        "client_ip": "201.11.13.33",
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

// Rota corrigida para a versão nova do Express
app.all(/\/live\/.*/, (req, res) => {
    res.json(gameConfig);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
