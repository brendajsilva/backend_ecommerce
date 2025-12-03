const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors({
  origin: ['https://front-ecommerce-henna.vercel.app', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir arquivos estáticos do frontend
app.use('/frontend', express.static(path.join(__dirname, '../frontend')))
app.use(express.static(path.join(__dirname, '../')))

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

// Rota raiz - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'))
})

// Rota para pegar produtos (compatibilidade com frontend)
app.get('/api/products', async (req, res) => {
    try {
        const { Produto } = require('./models/rel')
        const produtos = await Produto.findAll({
            where: { ativo: true }
        })
        res.json(produtos)
    } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        res.status(500).json({ error: 'Erro ao buscar produtos' })
    }
})

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ 
        error: 'Algo deu errado!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

// Função para atualizar status dos pedidos automaticamente
async function atualizarStatusPedidos() {
    const { Pedido } = require('./models/rel');

    try {
        const pedidos = await Pedido.findAll({
            where: {
                status: {
                    [require('sequelize').Op.notIn]: ['ENTREGUE', 'CANCELADO']
                }
            }
        });

        const agora = new Date();

        for (const pedido of pedidos) {
            const dataPedido = new Date(pedido.dataPedido);
            const diasPassados = Math.floor((agora - dataPedido) / (1000 * 60 * 60 * 24));

            let novoStatus = pedido.status;

            if (diasPassados >= 7) {
                novoStatus = 'ENTREGUE';
            } else if (diasPassados >= 5) {
                novoStatus = 'ENVIADO';
            } else if (diasPassados >= 3) {
                novoStatus = 'SEPARACAO_ESTOQUE';
            } else if (diasPassados >= 2) {
                novoStatus = 'PAGO';
            } else if (diasPassados >= 1) {
                novoStatus = 'PROCESSANDO_PAGAMENTO';
            }

            if (novoStatus !== pedido.status) {
                await pedido.update({ status: novoStatus });
                console.log(`Pedido ${pedido.codPedido} status atualizado para ${novoStatus}`);
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar status dos pedidos:', error);
    }
}

// Executar atualização a cada hora
setInterval(atualizarStatusPedidos, 60 * 60 * 1000); // 1 hora

// Iniciar servidor
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗')
    console.log(`║  🚀 Servidor rodando na porta ${PORT}   ║`)
    console.log('╚════════════════════════════════════════╝')
    console.log(`📍 http://localhost:${PORT}`)
    console.log(`📍 API: http://localhost:${PORT}/api`)
})

module.exports = app
