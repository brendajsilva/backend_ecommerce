require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const conn = require("./db/conn");
const path = require('path');

// =======================
// CONFIGURAÇÃO DE CORS
// =======================
app.use(cors({
  origin: "https://front-ecommerce-henna.vercel.app",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization"
}));

// Libera preflight para todas as rotas
app.options('*', cors());

// =======================
// MIDDLEWARES
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// ROTAS
// =======================
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

// Alias opcional caso seu front ainda chame /api/products
app.use('/api/products', produtoRoutes);

// =======================
// ROTA BASE
// =======================
app.get('/', (req, res) => {
  res.send("API BACKEND ONLINE ✔");
});

// =======================
// INICIAR SERVIDOR
// =======================
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

async function startServer() {
  try {
    await conn.authenticate();
    console.log("Banco conectado com sucesso!");

    app.listen(PORT, HOST, () => {
      console.log(`Servidor rodando em http://${HOST}:${PORT}`);
    });

  } catch (err) {
    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  }
}

startServer();
