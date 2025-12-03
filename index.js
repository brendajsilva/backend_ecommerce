// index.js — Backend corrigido e compatível com Railway + Front Vercel

const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// =========================
// 🔥 1. MIDDLEWARES GERAIS
// =========================

app.use(express.json());

// ⚠ CORS COMPLETO (Corrige seu erro principal)
app.use(cors({
    origin: [
        "https://front-ecommerce-henna.vercel.app",   // seu frontend
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));

// Middleware para garantir que OPTIONS responda 200
app.options("*", cors());

// =========================
// 🔥 2. IMPORTAR ROTAS
// =========================

const produtoRoutes = require("./produtoRoutes"); 
const usuarioRoutes = require("./usuarioRoutes"); 
const pedidoRoutes = require("./pedidoRoutes");
const enderecoRoutes = require("./enderecoRoutes");

// =========================
// 🔥 3. DEFINIR ROTAS BASE
// =========================

// ✔ Rota correta para produtos (corrigido!)
app.use("/api/produtos", produtoRoutes);

// ✔ Compatibilidade com seu front antigo
app.use("/api/products", produtoRoutes);

// ✔ Outras rotas do seu backend
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
