const express = require('express');
const app = express();

// O Render fornece a porta automaticamente através da variável de ambiente PORT.
// Caso esteja rodando localmente no seu PC, usará a porta 3000.
const PORT = process.env.PORT || 3000;

// Configuração para o Express conseguir ler os dados (JSON e formulários POST) enviados pelo jogo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota raiz apenas para você verificar pelo navegador se o servidor está rodando
app.get('/', (req, res) => {
    res.send('Servidor Backend Customizado - Online');
});

// ---------------------------------------------------------
// ROTAS DE AUTENTICAÇÃO E LOGIN
// ---------------------------------------------------------

app.post('/oauth/token/facebook/exchange', (req, res) => {
    console.log("[LOGIN] Tentativa de login via Facebook interceptada.");
    console.log("[LOGIN] Dados enviados pelo jogo:", req.body);

    // Estrutura JSON exata exigida pelo método exchangeTokenFromGOP no classes.dex
    const fakeLoginResponse = {
        open_id: "davi_admin_999",
        access_token: "token_seguro_123",
        expiry_time: 2147483647, // Valor alto para não expirar
        platform: 1              // 1 = GARENA_NATIVE_ANDROID
    };

    res.json(fakeLoginResponse);
    console.log("[LOGIN] Resposta de sucesso (JSON) enviada de volta para o jogo.");
});

// ---------------------------------------------------------
// OUTRAS ROTAS (Baseadas no SDKConstants)
// ---------------------------------------------------------

app.get('/app/info/get', (req, res) => {
    console.log("[INFO] O jogo solicitou a rota /app/info/get");
    
    // Retornando um JSON genérico por enquanto. Se o jogo travar aqui, 
    // precisaremos procurar o leitor dessa rota no Smali também.
    res.json({
        status: "success"
    });
});

app.get('/app/feedback/app/info/get', (req, res) => {
    console.log("[INFO] O jogo solicitou a rota de feedback de info");
    res.json({ status: "success" });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`[SISTEMA] Servidor rodando perfeitamente na porta ${PORT}`);
});
