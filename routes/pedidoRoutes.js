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

// Rotas ADMIN (rotas específicas SEMPRE antes da rota genérica)
router.get('/admin/todos', verificarToken, verificarAdmin, listarTodosPedidos)
router.get('/admin/estatisticas', verificarToken, verificarAdmin, obterEstatisticasPedidos)
router.get('/admin/:id', verificarToken, verificarAdmin, buscarPedidoPorIdAdmin)

// Listar pedidos por status (admin)
router.get('/status/:status', verificarToken, verificarAdmin, listarPedidosPorStatus)

// Buscar pedidos por usuário (admin)
router.get('/usuario/:idUsuario', verificarToken, verificarAdmin, buscarPedidosPorUsuario)

// Criar novo pedido
router.post('/', verificarToken, criarPedido)

// Atualizar pedido (usuário)
router.put('/:id', verificarToken, atualizarPedido)

// Atualizar status do pedido (admin)
router.patch('/:id/status', verificarToken, verificarAdmin, atualizarStatusPedido)

// Cancelar pedido (usuário ou admin)
router.patch('/:id/cancelar', verificarToken, cancelarPedido)

// ❗ ROTA GENÉRICA SEMPRE NO FINAL
router.get('/:id', verificarToken, buscarPedidoPorId)

module.exports = router
