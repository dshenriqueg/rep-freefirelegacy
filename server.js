const express = require('express');
const app = express();

app.use((req, res, next) => {
    req.url = req.url.replace(/\/+/g, '/');
    next();
});

// Coloque aqui o link RAW do seu arquivo config.json no GitHub
// Exemplo: https://raw.githubusercontent.com/seu-usuario/seu-repo/main/config.json
const EXTERNAL_JSON_URL = 'https://raw.githubusercontent.com/dshenriqueg/rep-freefirelegacy/refs/heads/main/config.json';

app.all('/live/*', async (req, res) => {
    try {
        const response = await fetch(EXTERNAL_JSON_URL);
        
        if (!response.ok) {
            throw new Error(`Erro ao acessar JSON do GitHub: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).send('Erro interno ao buscar configuração');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando e buscando JSON do GitHub na porta ${PORT}`);
});
