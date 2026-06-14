import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = globalThis.process?.env?.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir arquivos estáticos do diretório atual (onde o server.js está)
app.use(express.static(__dirname));

// Para rotas do React Router (SPA), sempre retornar index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

