require('dotenv').config()
const express = require('express')
const app = express()
const conn = require("./db/conn")
const cors = require('cors')

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0' // 0.0.0.0 é seguro e aceita conexões em PaaS

const isProduction = process.env.NODE_ENV === 'production'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Importar rotas
const usuarioRoutes = require('./routes/usuarioRoutes')
const produtoRoutes = require('./routes/produtoRoutes')
const pedidoRoutes = require('./routes/pedidoRoutes')
const enderecoRoutes = require('./routes/enderecoRoutes')
const contatoRoutes = require('./routes/contatoRoutes')

// Usar rotas
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/produtos', produtoRoutes)
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/enderecos', enderecoRoutes)
app.use('/api/contato', contatoRoutes)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'))
})

async function startServer() {
  try {
    if (!isProduction) {
      // Em desenvolvimento: sincroniza alterando o esquema para facilitar dev
      await conn.sync({ alter: true })
      console.log('Banco sincronizado (dev) com { alter: true }');
    } else {
      // Em produção: NÃO sincronize automaticamente (evita droppar/alterar sem controle)
      await conn.authenticate()
      console.log('Banco autenticado (produção)')
    }

    app.listen(PORT, HOST, () => {
      console.log(`Servidor rodando em http://${HOST}:${PORT}`)
    });
  } catch (err) {
    console.error('Erro ao conectar ao banco ou iniciar o servidor:', err)
    process.exit(1) // sai com erro para o Railway identificar falha no deploy
  }
}

startServer()