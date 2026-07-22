const express = require("express");

const app = express();

app.use(express.json());

app.get("/app/info/get", (req, res) => {
    console.log("Requisição recebida:", req.query);

    res.json({
        client_log: false
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
