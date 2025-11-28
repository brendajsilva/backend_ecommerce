const { Produto, Estoque } = require('../models/rel')

// Listar todos os produtos ativos
const listarProdutos = async (req, res) => {
    try {
        const produtos = await Produto.findAll({
            where: { ativo: true },
            include: [{
                model: Estoque,
                as: 'estoqueProduto',
                attributes: ['quantidade_atual', 'quantidade_minima']
            }]
        })

        res.json(produtos)

    } catch (error) {
        console.error('Erro ao listar produtos:', error)
        res.status(500).json({ error: 'Erro ao listar produtos' })
    }
}

// Listar todos os produtos para admin (incluindo inativos)
const listarProdutosAdmin = async (req, res) => {
    try {
        const produtos = await Produto.findAll({
            include: [{
                model: Estoque,
                as: 'estoqueProduto',
                attributes: ['quantidade_atual', 'quantidade_minima']
            }],
            order: [['createdAt', 'DESC']]
        })

        res.json(produtos)

    } catch (error) {
        console.error('Erro ao listar produtos para admin:', error)
        res.status(500).json({ error: 'Erro ao listar produtos' })
    }
}

// Buscar produto por ID
const buscarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params

        const produto = await Produto.findByPk(id, {
            include: [{
                model: Estoque,
                as: 'estoqueProduto',
                attributes: ['quantidade_atual', 'quantidade_minima']
            }]
        })

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' })
        }

        res.json(produto)

    } catch (error) {
        console.error('Erro ao buscar produto:', error)
        res.status(500).json({ error: 'Erro ao buscar produto' })
    }
}

// Criar produto (admin)
const criarProduto = async (req, res) => {
    try {
        const { nome, descricao, modelo, preco, imagem_url, quantidade_estoque } = req.body

        if (!nome || !modelo || !preco) {
            return res.status(400).json({ error: 'Nome, modelo e preço são obrigatórios' })
        }

        // Criar produto
        const novoProduto = await Produto.create({
            nome,
            descricao: descricao || '',
            modelo,
            preco,
            imagem_url: imagem_url || null,
            ativo: true
        })

        // Criar estoque
        await Estoque.create({
            idProduto: novoProduto.codProduto,
            quantidade_atual: quantidade_estoque || 0,
            quantidade_minima: 5
        })

        res.status(201).json({
            message: 'Produto criado com sucesso',
            produto: novoProduto
        })

    } catch (error) {
        console.error('Erro ao criar produto:', error)
        res.status(500).json({ error: 'Erro ao criar produto', details: error.message })
    }
}

// Atualizar produto (admin)
const atualizarProduto = async (req, res) => {
    try {
        const { id } = req.params
        const { nome, descricao, modelo, preco, imagem_url, ativo } = req.body

        const produto = await Produto.findByPk(id)

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' })
        }

        // Atualizar campos
        if (nome) produto.nome = nome
        if (descricao !== undefined) produto.descricao = descricao
        if (modelo) produto.modelo = modelo
        if (preco) produto.preco = preco
        if (imagem_url !== undefined) produto.imagem_url = imagem_url
        if (ativo !== undefined) produto.ativo = ativo

        await produto.save()

        res.json({
            message: 'Produto atualizado com sucesso',
            produto
        })

    } catch (error) {
        console.error('Erro ao atualizar produto:', error)
        res.status(500).json({ error: 'Erro ao atualizar produto' })
    }
}

// Deletar produto (admin) - apenas desativa
const deletarProduto = async (req, res) => {
    try {
        const { id } = req.params

        const produto = await Produto.findByPk(id)

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' })
        }

        // Desativar ao invés de deletar
        produto.ativo = false
        await produto.save()

        res.json({ message: 'Produto desativado com sucesso' })

    } catch (error) {
        console.error('Erro ao deletar produto:', error)
        res.status(500).json({ error: 'Erro ao deletar produto' })
    }
}

// Atualizar estoque (admin)
const atualizarEstoque = async (req, res) => {
    try {
        const { id } = req.params
        const { quantidade } = req.body

        if (quantidade === undefined) {
            return res.status(400).json({ error: 'Quantidade é obrigatória' })
        }

        const estoque = await Estoque.findOne({
            where: { idProduto: id }
        })

        if (!estoque) {
            return res.status(404).json({ error: 'Estoque não encontrado' })
        }

        estoque.quantidade_atual = quantidade
        await estoque.save()

        res.json({
            message: 'Estoque atualizado com sucesso',
            estoque
        })

    } catch (error) {
        console.error('Erro ao atualizar estoque:', error)
        res.status(500).json({ error: 'Erro ao atualizar estoque' })
    }
}

module.exports = {
    listarProdutos,
    listarProdutosAdmin,
    buscarProdutoPorId,
    criarProduto,
    atualizarProduto,
    deletarProduto,
    atualizarEstoque
}
