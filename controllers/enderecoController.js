const { Endereco } = require('../models/rel')

// Listar endereços do usuário logado
const listarEnderecos = async (req, res) => {
    try {
        const enderecos = await Endereco.findAll({
            where: { idUsuario: req.userId },
            order: [['is_principal', 'DESC'], ['createdAt', 'DESC']]
        })

        res.json(enderecos)

    } catch (error) {
        console.error('Erro ao listar endereços:', error)
        res.status(500).json({ error: 'Erro ao listar endereços' })
    }
}

// Buscar endereço por ID
const buscarEnderecoPorId = async (req, res) => {
    try {
        const { id } = req.params

        const endereco = await Endereco.findOne({
            where: {
                codEndereco: id,
                idUsuario: req.userId
            }
        })

        if (!endereco) {
            return res.status(404).json({ error: 'Endereço não encontrado' })
        }

        res.json(endereco)

    } catch (error) {
        console.error('Erro ao buscar endereço:', error)
        res.status(500).json({ error: 'Erro ao buscar endereço' })
    }
}

// Criar novo endereço
const criarEndereco = async (req, res) => {
    try {
        const {
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            localidade,
            uf,
            apelido,
            is_principal
        } = req.body

        // Validações
        if (!cep || !logradouro || !numero || !bairro || !localidade || !uf) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
        }

        // Se for endereço principal, desmarcar outros
        if (is_principal) {
            await Endereco.update(
                { is_principal: false },
                { where: { idUsuario: req.userId } }
            )
        }

        // Criar endereço
        const novoEndereco = await Endereco.create({
            idUsuario: req.userId,
            cep,
            logradouro,
            numero,
            complemento: complemento || null,
            bairro,
            localidade,
            uf: uf.toUpperCase(),
            apelido: apelido || null,
            is_principal: is_principal || false
        })

        res.status(201).json({
            message: 'Endereço criado com sucesso',
            endereco: novoEndereco
        })

    } catch (error) {
        console.error('Erro ao criar endereço:', error)
        res.status(500).json({ error: 'Erro ao criar endereço', details: error.message })
    }
}

// Atualizar endereço
const atualizarEndereco = async (req, res) => {
    try {
        const { id } = req.params
        const {
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            localidade,
            uf,
            apelido,
            is_principal
        } = req.body

        const endereco = await Endereco.findOne({
            where: {
                codEndereco: id,
                idUsuario: req.userId
            }
        })

        if (!endereco) {
            return res.status(404).json({ error: 'Endereço não encontrado' })
        }

        // Se for endereço principal, desmarcar outros
        if (is_principal && !endereco.is_principal) {
            await Endereco.update(
                { is_principal: false },
                { where: { idUsuario: req.userId } }
            )
        }

        // Atualizar campos
        if (cep) endereco.cep = cep
        if (logradouro) endereco.logradouro = logradouro
        if (numero) endereco.numero = numero
        if (complemento !== undefined) endereco.complemento = complemento
        if (bairro) endereco.bairro = bairro
        if (localidade) endereco.localidade = localidade
        if (uf) endereco.uf = uf.toUpperCase()
        if (apelido !== undefined) endereco.apelido = apelido
        if (is_principal !== undefined) endereco.is_principal = is_principal

        await endereco.save()

        res.json({
            message: 'Endereço atualizado com sucesso',
            endereco
        })

    } catch (error) {
        console.error('Erro ao atualizar endereço:', error)
        res.status(500).json({ error: 'Erro ao atualizar endereço' })
    }
}

// Deletar endereço
const deletarEndereco = async (req, res) => {
    try {
        const { id } = req.params

        const endereco = await Endereco.findOne({
            where: {
                codEndereco: id,
                idUsuario: req.userId
            }
        })

        if (!endereco) {
            return res.status(404).json({ error: 'Endereço não encontrado' })
        }

        await endereco.destroy()

        res.json({ message: 'Endereço deletado com sucesso' })

    } catch (error) {
        console.error('Erro ao deletar endereço:', error)
        res.status(500).json({ error: 'Erro ao deletar endereço' })
    }
}

// Definir endereço como principal
const definirEnderecoPrincipal = async (req, res) => {
    try {
        const { id } = req.params

        const endereco = await Endereco.findOne({
            where: {
                codEndereco: id,
                idUsuario: req.userId
            }
        })

        if (!endereco) {
            return res.status(404).json({ error: 'Endereço não encontrado' })
        }

        // Desmarcar todos os outros
        await Endereco.update(
            { is_principal: false },
            { where: { idUsuario: req.userId } }
        )

        // Marcar este como principal
        endereco.is_principal = true
        await endereco.save()

        res.json({
            message: 'Endereço principal atualizado com sucesso',
            endereco
        })

    } catch (error) {
        console.error('Erro ao definir endereço principal:', error)
        res.status(500).json({ error: 'Erro ao definir endereço principal' })
    }
}

module.exports = {
    listarEnderecos,
    buscarEnderecoPorId,
    criarEndereco,
    atualizarEndereco,
    deletarEndereco,
    definirEnderecoPrincipal
}
