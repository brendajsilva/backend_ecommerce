const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------------------------------------------
   🚀 CORS GLOBAL — para Vercel + Localhost
------------------------------------------------------- */
app.use(cors({
  origin: ['https://front-ecommerce-henna.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

/* -------------------------------------------------------
   🚀 Preflight (OPTIONS) — CORREÇÃO NODE 22 / EXPRESS 5
------------------------------------------------------- */
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header("Access-Control-Allow-Origin", "https://front-ecommerce-henna.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204); // pré-liberação
  }
  next();
});

/* -------------------------------------------------------
   Middlewares
------------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos (caso precise)
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../')));

/* -------------------------------------------------------
   Rotas Importadas
------------------------------------------------------- */
const usuarioRoutes = require('./routes/usuarioRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const enderecoRoutes = require('./routes/enderecoRoutes');
const contatoRoutes = require('./routes/contatoRoutes');

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productions', produtoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/enderecos', enderecoRoutes);
app.use('/api/contato', contatoRoutes);

/* -------------------------------------------------------
   Página inicial
------------------------------------------------------- */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

/* -------------------------------------------------------
   Rota compatível /api/products (usada no frontend)
------------------------------------------------------- */
app.get('/api/products', async (req, res) => {
  try {
    const { Produto } = require('./models/rel');

    const produtos = await Produto.findAll({
      where: { ativo: true }
    });

    res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

/* -------------------------------------------------------
   Tratamento global de erros
------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error('🔥 ERRO GLOBAL:', err.stack);
  res.status(500).json({
    error: 'Erro interno no servidor',
  });
});

/* -------------------------------------------------------
   Iniciar servidor no Railway
------------------------------------------------------- */
app.listen(PORT, '0.0.0.0', () => {
  console.log('╔════════════════════════════════════════╗');
  console.log(`║  🚀 Servidor rodando na porta ${PORT}   ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log(`📍 API ativa e com CORS liberado`);
});

module.exports = app;
