require('dotenv').config();
const express = require('express');
const app = express();
const conn = require("./db/conn");
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(cors({
  origin: ['https://front-ecommerce-henna.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const usuarioRoutes = require('./routes/usuarioRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const enderecoRoutes = require('./routes/enderecoRoutes');
const contatoRoutes = require('./routes/contatoRoutes');

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/enderecos', enderecoRoutes);
app.use('/api/contato', contatoRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Iniciar
async function startServer() {
    try {
        await conn.authenticate();
        console.log("Banco conectado.");
        
        app.listen(PORT, HOST, () => {
            console.log(`Servidor rodando em http://${HOST}:${PORT}`);
        });

    } catch (err) {
        console.error("Erro ao iniciar servidor:", err);
        process.exit(1);
    }
}

startServer();
