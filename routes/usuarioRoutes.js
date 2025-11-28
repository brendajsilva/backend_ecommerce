const express = require('express')
const router = express.Router()
const {
    registrarUsuario,
    loginUsuario,
    buscarPerfil,
    atualizarPerfil,
    listarUsuarios
} = require('../controllers/usuarioController')
const { verificarToken, verificarAdmin } = require('../middlewares/auth')

// Rotas públicas
router.post('/registro', registrarUsuario)
router.post('/cadastro', registrarUsuario) // Alias para registro
router.post('/login', loginUsuario)

// Rotas protegidas (requer autenticação)
router.get('/perfil', verificarToken, buscarPerfil)
router.put('/perfil', verificarToken, atualizarPerfil)

// Rotas admin
router.get('/', verificarToken, verificarAdmin, listarUsuarios)

module.exports = router
