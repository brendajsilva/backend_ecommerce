const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Usuario } = require('../models/rel')

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-dev'
const JWT_EXPIRATION = '7d'

// Registrar novo usuário
const registrarUsuario = async (req, res) => {
    try {
        const { username, nome, email, senha, telefone, cpf, identidade } = req.body

        // Validações
        if (!username || !nome || !email || !senha || !cpf) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
        }

        // Verificar se usuário já existe
        const usuarioExistente = await Usuario.findOne({
            where: { email }
        })

        if (usuarioExistente) {
            return res.status(400).json({ error: 'Email já cadastrado' })
        }

        // Verificar CPF duplicado
        const cpfExistente = await Usuario.findOne({
            where: { cpf }
        })

        if (cpfExistente) {
            return res.status(400).json({ error: 'CPF já cadastrado' })
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10)

        // Criar usuário
        const novoUsuario = await Usuario.create({
            nome: username, // Usar username como nome de login
            nome_completo: nome, // Nome completo
            email,
            senha: senhaHash,
            telefone: telefone || '',
            cpf,
            identidade: identidade || null,
            tipo_usuario: 'CLIENTE'
        })

        // Gerar token
        const token = jwt.sign(
            { id: novoUsuario.codUsuario, tipo: novoUsuario.tipo_usuario },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        )

        res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            usuario: {
                id: novoUsuario.codUsuario,
                username: novoUsuario.nome,
                nome: novoUsuario.nome_completo,
                email: novoUsuario.email,
                telefone: novoUsuario.telefone,
                cpf: novoUsuario.cpf,
                tipo: novoUsuario.tipo_usuario
            },
            token
        })

    } catch (error) {
        console.error('Erro ao registrar usuário:', error)
        res.status(500).json({ error: 'Erro ao registrar usuário', details: error.message })
    }
}

// Login
const loginUsuario = async (req, res) => {
    console.log('🔐 Tentativa de login recebida:', { usuario: req.body.usuario, senhaLength: req.body.senha?.length })
    try {
        const { usuario, senha } = req.body

        if (!usuario || !senha) {
            console.log('❌ Campos obrigatórios não preenchidos')
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' })
        }

        // Buscar usuário por email, nome, CPF ou identidade
        console.log('🔍 Buscando usuário:', usuario)
        const usuarioLimpo = usuario.replace(/\D/g, ''); // Remove formatação para CPF/RG
        const Op = require('sequelize').Op;
        const user = await Usuario.findOne({
            where: {
                [Op.or]: [
                    { email: usuario },
                    { nome: usuario },
                    { cpf: { [Op.in]: [usuario, usuarioLimpo] } },
                    { identidade: { [Op.in]: [usuario, usuarioLimpo] } }
                ]
            }
        })

        if (!user) {
            console.log('❌ Usuário não encontrado:', usuario)
            return res.status(401).json({ error: 'Credenciais inválidas' })
        }

        console.log('✅ Usuário encontrado:', user.codUsuario, user.email)

        // Verificar senha
        console.log('🔒 Verificando senha...')
        const senhaValida = await bcrypt.compare(senha, user.senha)

        if (!senhaValida) {
            console.log('❌ Senha inválida para usuário:', user.codUsuario)
            return res.status(401).json({ error: 'Credenciais inválidas' })
        }

        console.log('✅ Senha válida, gerando token...')

        // Gerar token
        const token = jwt.sign(
            { id: user.codUsuario, tipo: user.tipo_usuario },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        )

        console.log('🎉 Login realizado com sucesso para usuário:', user.codUsuario)

        res.json({
            message: 'Login realizado com sucesso',
            usuario: {
                id: user.codUsuario,
                username: user.nome,
                nome: user.nome_completo,
                email: user.email,
                telefone: user.telefone,
                cpf: user.cpf,
                tipo: user.tipo_usuario
            },
            token
        })

    } catch (error) {
        console.error('💥 Erro ao fazer login:', error)
        res.status(500).json({ error: 'Erro ao fazer login' })
    }
}

// Buscar perfil do usuário logado
const buscarPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.userId, {
            attributes: { exclude: ['senha'] }
        })

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        // Return with nome as nome_completo for display
        const perfil = usuario.toJSON();
        perfil.nome = perfil.nome_completo || perfil.nome;

        res.json(perfil)

    } catch (error) {
        console.error('Erro ao buscar perfil:', error)
        res.status(500).json({ error: 'Erro ao buscar perfil' })
    }
}

// Atualizar perfil
const atualizarPerfil = async (req, res) => {
    try {
        const { nome, telefone, email } = req.body

        const usuario = await Usuario.findByPk(req.userId)

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        // Atualizar dados
        if (nome) usuario.nome_completo = nome
        if (telefone) usuario.telefone = telefone
        if (email && email !== usuario.email) {
            // Verificar se email já existe
            const emailExiste = await Usuario.findOne({ where: { email } })
            if (emailExiste) {
                return res.status(400).json({ error: 'Email já cadastrado' })
            }
            usuario.email = email
        }

        await usuario.save()

        res.json({
            message: 'Perfil atualizado com sucesso',
            usuario: {
                id: usuario.codUsuario,
                nome: usuario.nome_completo,
                email: usuario.email,
                telefone: usuario.telefone
            }
        })

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error)
        res.status(500).json({ error: 'Erro ao atualizar perfil' })
    }
}

// Listar todos os usuários (admin)
const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['senha'] }
        })

        res.json(usuarios)

    } catch (error) {
        console.error('Erro ao listar usuários:', error)
        res.status(500).json({ error: 'Erro ao listar usuários' })
    }
}

module.exports = {
    registrarUsuario,
    loginUsuario,
    buscarPerfil,
    atualizarPerfil,
    listarUsuarios
}
