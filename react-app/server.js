const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Servir arquivos estáticos do diretório atual (onde o server.js está)
app.use(express.static(__dirname));

// Para rotas do React Router (SPA), sempre retornar index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

