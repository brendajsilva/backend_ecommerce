// index.js — Backend corrigido e compatível com Railway + Front Vercel

const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// =========================
// 🔥 1. MIDDLEWARES GERAIS
// =========================

app.use(express.json());

app.use(cors({
  origin: 'https://ecommerce-three-eta-40.vercel.app', // A URL exata do seu front na Vercel (sem barra no final)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Aplica CORS
app.use(cors(corsOptions));

// Middleware manual para OPTIONS (SE NECESSÁRIO)
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        res.header("Access-Control-Allow-Credentials", "true");
        return res.status(200).end();
    }
    next();
});

// =========================
// 🔥 2. IMPORTAR ROTAS
// =========================

const produtoRoutes = require("./routes/produtoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes"); 
const pedidoRoutes = require("./routes/pedidoRoutes");
const enderecoRoutes = require("./routes/enderecoRoutes");

// =========================
// 🔥 3. DEFINIR ROTAS BASE
// =========================

app.use("/api/produtos", produtoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/enderecos", enderecoRoutes);

// =========================
// 🔥 4. ROTA DE TESTE
// =========================

app.get("/", (req, res) => {
    res.json({ message: "API funcionando! 🚀" });
});

// =========================
// 🔥 5. ERROS GLOBAIS
// =========================

app.use((err, req, res, next) => {
    console.error("🔥 ERRO NO SERVIDOR:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
});

// =========================
// 🔥 6. INICIAR SERVIDOR
// =========================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});