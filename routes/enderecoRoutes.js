const express = require('express')
const router = express.Router()
const { verificarToken } = require('../middlewares/auth')
const {
    listarEnderecos,
    buscarEnderecoPorId,
    criarEndereco,
    atualizarEndereco,
    deletarEndereco,
    definirEnderecoPrincipal
} = require('../controllers/enderecoController')

// Listar endereços do usuário logado
router.get('/', verificarToken, listarEnderecos)

// Buscar endereço por ID
router.get('/:id', verificarToken, buscarEnderecoPorId)

// Criar novo endereço
router.post('/', verificarToken, criarEndereco)

// Atualizar endereço
router.put('/:id', verificarToken, atualizarEndereco)

// Deletar endereço
router.delete('/:id', verificarToken, deletarEndereco)

// Definir endereço como principal
router.patch('/:id/principal', verificarToken, definirEnderecoPrincipal)

module.exports = router
