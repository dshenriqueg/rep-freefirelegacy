const express = require('express');
const app = express();

// Permite que o servidor entenda JSON enviado pelo jogo
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Rota 1: Configuração inicial que o jogo procura
app.get('/app/info/get', (req, res) => {
    console.log("O jogo pediu as configurações via /app/info/get");
    // O jogo espera um JSON estruturado aqui
    res.json({
        status: "success",
        // O restante do payload original deve ser inserido aqui
    });
});

// Rota 2: Registro de conta convidado (Guest)
app.post('/oauth/guest/register', (req, res) => {
    console.log("Tentativa de criar conta guest", req.body);
    res.json({
        // Payload validando o cadastro da conta
    });
});

// SISTEMA DE RADAR: Captura qualquer rota que não existe ainda
app.use((req, res) => {
    console.log(`[ALERTA 404] O jogo tentou acessar a rota: ${req.method} ${req.url}`);
    res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
});
