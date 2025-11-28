const express = require('express')
const router = express.Router()
const { verificarToken, verificarAdmin } = require('../middlewares/auth')
const {
    listarProdutos,
    listarProdutosAdmin,
    buscarProdutoPorId,
    criarProduto,
    atualizarProduto,
    deletarProduto,
    atualizarEstoque
} = require('../controllers/produtoController')

// Listar todos os produtos ativos (público)
router.get('/', listarProdutos)

// Listar todos os produtos para admin (apenas admin)
router.get('/admin', verificarToken, verificarAdmin, listarProdutosAdmin)

// Buscar produto por ID (público)
router.get('/:id', buscarProdutoPorId)

// Criar produto (apenas admin)
router.post('/', verificarToken, verificarAdmin, criarProduto)

// Atualizar produto (apenas admin)
router.put('/:id', verificarToken, verificarAdmin, atualizarProduto)

// Deletar produto (apenas admin)
router.delete('/:id', verificarToken, verificarAdmin, deletarProduto)

// Atualizar estoque (apenas admin)
router.patch('/:id/estoque', verificarToken, verificarAdmin, atualizarEstoque)

module.exports = router
