// index.js — Backend corrigido e compatível com Railway + Front Vercel

const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// =========================
// 🔥 1. MIDDLEWARES GERAIS
// =========================

app.use(express.json());

// ⚠ CORS COMPLETO
const corsOptions = {
    origin: [
        "https://front-ecommerce-henna.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

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

const produtoRoutes = require("./produtoRoutes"); 
const usuarioRoutes = require("./usuarioRoutes"); 
const pedidoRoutes = require("./pedidoRoutes");
const enderecoRoutes = require("./enderecoRoutes");

// =========================
// 🔥 3. DEFINIR ROTAS BASE
// =========================

app.use("/api/produtos", produtoRoutes);
app.use("/api/products", produtoRoutes);
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