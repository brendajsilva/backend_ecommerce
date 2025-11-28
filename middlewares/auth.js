const jwt = require('jsonwebtoken')

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave-secreta-dev')
        req.userId = decoded.id
        req.userTipo = decoded.tipo
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
}

// Middleware para verificar se é admin
const verificarAdmin = (req, res, next) => {
    if (req.userTipo !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
    }
    next()
}

module.exports = {
    verificarToken,
    verificarAdmin
}
