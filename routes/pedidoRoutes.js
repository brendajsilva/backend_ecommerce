const express = require('express')
const router = express.Router()
const { verificarToken, verificarAdmin } = require('../middlewares/auth')
const {
    listarPedidosUsuario,
    buscarPedidoPorId,
    criarPedido,
    atualizarStatusPedido,
    cancelarPedido,
    listarTodosPedidos,
    buscarPedidoPorIdAdmin,
    reembolsarPedido,
    buscarPedidosPorUsuario,
    atualizarPedido,
    listarPedidosPorStatus,
    obterEstatisticasPedidos
} = require('../controllers/pedidoController')

// Listar pedidos do usuário logado
router.get('/', verificarToken, listarPedidosUsuario)

// Buscar pedido por ID (do usuário logado)
router.get('/:id', verificarToken, buscarPedidoPorId)

// Criar novo pedido
router.post('/', verificarToken, criarPedido)

// Atualizar status do pedido (apenas admin)
router.patch('/:id/status', verificarToken, verificarAdmin, atualizarStatusPedido)

// Cancelar pedido (usuário ou admin)
router.patch('/:id/cancelar', verificarToken, cancelarPedido)

// Listar todos os pedidos (apenas admin)
router.get('/admin/todos', verificarToken, verificarAdmin, listarTodosPedidos)

// Buscar pedido por ID (admin)
router.get('/admin/:id', verificarToken, verificarAdmin, buscarPedidoPorIdAdmin);

// Atualizar pedido (usuário)
router.put('/:id', verificarToken, atualizarPedido)

// Reembolsar pedido (admin)
router.patch('/:id/reembolsar', verificarToken, verificarAdmin, reembolsarPedido)

// Listar pedidos por status (admin)
router.get('/status/:status', verificarToken, verificarAdmin, listarPedidosPorStatus)

// Buscar pedidos por usuário (admin)
router.get('/usuario/:idUsuario', verificarToken, verificarAdmin, buscarPedidosPorUsuario)

// Estatísticas de pedidos (admin)
router.get('/admin/estatisticas', verificarToken, verificarAdmin, obterEstatisticasPedidos)

module.exports = router
