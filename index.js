// index.js — Backend corrigido e compatível com Railway + Front Vercel

const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// =========================
// 🔥 1. MIDDLEWARES GERAIS
// =========================

app.use(express.json());

// CORS corrigido — aceita os 2 frontends da Vercel
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://ecommerce-three-eta-40.vercel.app",
    "https://front-ecommerce-henna.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

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

app.use("/produtos", produtoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/enderecos", enderecoRoutes);

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
