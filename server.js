const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

// Middleware para limpar barras duplas/múltiplas excessivas na URL (corrige o padding do APK)
app.use((req, res, next) => {
    req.url = req.url.replace(/\/+/g, '/');
    next();
});

// Agora a rota vai aceitar perfeitamente qualquer quantidade de barras antes de /live/ver.php
app.get('/live/ver.php', (req, res) => {
    res.status(200).json({
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
        "remote_version": "1.29.3",
        "server_url": "https://rep-freefirelegacy.onrender.com/"
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando e escutando na porta ${port}`);
});
