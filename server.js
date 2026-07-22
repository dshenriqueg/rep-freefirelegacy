const express = require('express');
const app = express();

// O Render define a porta automaticamente através da variável de ambiente PORT.
// Caso esteja rodando localmente no seu PC, ele usará a porta 3000.
const port = process.env.PORT || 3000;

// Configurando a rota exata que o jogo busca
app.get('/live/ver.php', (req, res) => {
    
    // O jogo espera um status 200 (OK) e o objeto JSON
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
