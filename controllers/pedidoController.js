const { Pedido, ItemPedido, Produto, Endereco, Usuario, Entrega, Estoque } = require('../models/rel')
const { Op } = require('sequelize')

// Criar novo pedido
const criarPedido = async (req, res) => {
    try {
        const {
            itens, // Array de { idProduto, quantidade }
            idEndereco,
            metodoPagamento,
            cupomDesconto
        } = req.body

        // Validações
        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ error: 'Itens do pedido são obrigatórios' })
        }

        if (!idEndereco) {
            return res.status(400).json({ error: 'Endereço de entrega é obrigatório' })
        }

        if (!metodoPagamento) {
            return res.status(400).json({ error: 'Método de pagamento é obrigatório' })
        }

        // Verificar se o endereço pertence ao usuário
        const endereco = await Endereco.findOne({
            where: {
                codEndereco: idEndereco,
                idUsuario: req.userId
            }
        })

        if (!endereco) {
            return res.status(404).json({ error: 'Endereço não encontrado' })
        }

        // Calcular valores
        let valorSubtotal = 0
        const itensPedido = []

        for (const item of itens) {
            const produto = await Produto.findByPk(item.idProduto)

            if (!produto) {
                return res.status(404).json({ error: `Produto ${item.idProduto} não encontrado` })
            }

            if (!produto.ativo) {
                return res.status(400).json({ error: `Produto ${produto.nome} não está disponível` })
            }

            // Verificar estoque
            const estoque = await Estoque.findOne({
                where: { idProduto: produto.codProduto }
            })

            if (estoque && estoque.quantidade_atual < item.quantidade) {
                return res.status(400).json({
                    error: `Estoque insuficiente para ${produto.nome}. Disponível: ${estoque.quantidade_atual}`
                })
            }

            const valorItem = parseFloat(produto.preco) * item.quantidade
            valorSubtotal += valorItem

            itensPedido.push({
                idProduto: produto.codProduto,
                quantidade: item.quantidade,
                precoUnitario: produto.preco,
                valorTotalItem: valorItem
            })
        }

        // Calcular frete (simplificado - pode ser integrado com API de frete)
        const valorFrete = 50.00

        // Aplicar desconto de cupom (se houver)
        let valorDesconto = 0
        if (cupomDesconto) {
            // Lógica de cupom - exemplo: 10% de desconto
            valorDesconto = valorSubtotal * 0.1
        }

        const valorTotal = valorSubtotal + valorFrete - valorDesconto

        // Criar pedido
        const novoPedido = await Pedido.create({
            idUsuario: req.userId,
            idEndereco,
            dataPedido: new Date(),
            status: 'PENDENTE_PAGAMENTO',
            valorSubtotal,
            valorFrete,
            valorTotal,
            metodoPagamento
        })

        // Criar itens do pedido
        for (const item of itensPedido) {
            await ItemPedido.create({
                idPedido: novoPedido.codPedido,
                ...item
            })

            // Atualizar estoque
            const estoque = await Estoque.findOne({
                where: { idProduto: item.idProduto }
            })

            if (estoque) {
                estoque.quantidade_atual -= item.quantidade
                await estoque.save()
            }
        }

        // Criar registro de entrega
        const dataEstimada = new Date()
        dataEstimada.setDate(dataEstimada.getDate() + 7) // 7 dias para entrega

        await Entrega.create({
            idPedido: novoPedido.codPedido,
            dataEstimada,
            statusEntrega: 'AGUARDANDO_ENVIO'
        })

        // Buscar pedido completo
        const pedidoCompleto = await Pedido.findByPk(novoPedido.codPedido, {
            include: [
                {
                    model: ItemPedido,
                    as: 'itensPedido',
                    include: [{
                        model: Produto,
                        as: 'produtoItem'
                    }]
                },
                {
                    model: Endereco,
                    as: 'enderecoEntrega'
                },
                {
                    model: Entrega,
                    as: 'entregaPedido'
                }
            ]
        })

        res.status(201).json({
            message: 'Pedido criado com sucesso',
            pedido: pedidoCompleto
        })

    } catch (error) {
        console.error('Erro ao criar pedido:', error)
        res.status(500).json({ error: 'Erro ao criar pedido', details: error.message })
    }
}

// Listar pedidos do usuário
const listarPedidosUsuario = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            where: { idUsuario: req.userId },
            include: [
                {
                    model: ItemPedido,
                    as: 'itensPedido',
                    include: [{
                        model: Produto,
                        as: 'produtoItem'
                    }]
                },
                {
                    model: Endereco,
                    as: 'enderecoEntrega'
                },
                {
                    model: Entrega,
                    as: 'entregaPedido'
                }
            ],
            order: [['dataPedido', 'DESC']]
        })

        res.json(pedidos)

    } catch (error) {
        console.error('Erro ao listar pedidos:', error)
        res.status(500).json({ error: 'Erro ao listar pedidos' })
    }
}

// Buscar pedido por ID
const buscarPedidoPorId = async (req, res) => {
    try {
        const { id } = req.params

        const pedido = await Pedido.findOne({
            where: {
                codPedido: id,
                idUsuario: req.userId
            },
            include: [
                {
                    model: ItemPedido,
                    as: 'itensPedido',
                    include: [{
                        model: Produto,
                        as: 'produtoItem'
                    }]
                },
                {
                    model: Endereco,
                    as: 'enderecoEntrega'
                },
                {
                    model: Entrega,
                    as: 'entregaPedido'
                }
            ]
        })

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' })
        }

        res.json(pedido)

    } catch (error) {
        console.error('Erro ao buscar pedido:', error)
        res.status(500).json({ error: 'Erro ao buscar pedido' })
    }
}

// Cancelar pedido
const cancelarPedido = async (req, res) => {
    try {
        const { id } = req.params

        const pedido = await Pedido.findOne({
            where: {
                codPedido: id,
                idUsuario: req.userId
            },
            include: [{
                model: ItemPedido,
                as: 'itensPedido'
            }]
        })

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' })
        }

        // Verificar se pedido pode ser cancelado
        if (['ENVIADO', 'ENTREGUE'].includes(pedido.status)) {
            return res.status(400).json({ error: 'Pedido não pode ser cancelado' })
        }

        // Devolver itens ao estoque
        for (const item of pedido.itensPedido) {
            const estoque = await Estoque.findOne({
                where: { idProduto: item.idProduto }
            })

            if (estoque) {
                estoque.quantidade_atual += item.quantidade
                await estoque.save()
            }
        }

        // Atualizar status
        pedido.status = 'CANCELADO'
        await pedido.save()

        // Atualizar entrega
        await Entrega.update(
            { statusEntrega: 'DEVOLVIDO' },
            { where: { idPedido: pedido.codPedido } }
        )

        res.json({
            message: 'Pedido cancelado com sucesso',
            pedido
        })

    } catch (error) {
        console.error('Erro ao cancelar pedido:', error)
        res.status(500).json({ error: 'Erro ao cancelar pedido' })
    }
}

// Listar todos os pedidos (admin)
const listarTodosPedidos = async (req, res) => {
    try {
        const { status, dataInicio, dataFim } = req.query

        const where = {}

        if (status) {
            where.status = status
        }

        if (dataInicio && dataFim) {
            where.dataPedido = {
                [Op.between]: [new Date(dataInicio), new Date(dataFim)]
            }
        }

        const pedidos = await Pedido.findAll({
            where,
            include: [
                {
                    model: Usuario,
                    as: 'usuarioPedido',
                    attributes: ['codUsuario', 'nome', 'email']
                },
                {
                    model: ItemPedido,
                    as: 'itensPedido',
                    include: [{
                        model: Produto,
                        as: 'produtoItem'
                    }]
                },
                {
                    model: Endereco,
                    as: 'enderecoEntrega'
                },
                {
                    model: Entrega,
                    as: 'entregaPedido'
                }
            ],
            order: [['dataPedido', 'DESC']]
        })

        res.json(pedidos)

    } catch (error) {
        console.error('Erro ao listar todos os pedidos:', error)
        res.status(500).json({ error: 'Erro ao listar pedidos' })
    }
}

// Atualizar status do pedido (admin)
const atualizarStatusPedido = async (req, res) => {
    try {
        const { id } = req.params
        const { status, statusEntrega, codigoRastreio, transportadora } = req.body

        const pedido = await Pedido.findByPk(id)

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' })
        }

        // Atualizar status do pedido
        if (status) {
            pedido.status = status
            await pedido.save()
        }

        // Atualizar informações de entrega
        if (statusEntrega || codigoRastreio || transportadora) {
            const entrega = await Entrega.findOne({
                where: { idPedido: id }
            })

            if (entrega) {
                if (statusEntrega) entrega.statusEntrega = statusEntrega
                if (codigoRastreio) entrega.codigoRastreio = codigoRastreio
                if (transportadora) entrega.transportadora = transportadora

                if (statusEntrega === 'ENTREGUE') {
                    entrega.dataEntrega = new Date()
                }

                await entrega.save()
            }
        }

        // Buscar pedido atualizado
        const pedidoAtualizado = await Pedido.findByPk(id, {
            include: [
                {
                    model: Entrega,
                    as: 'entregaPedido'
                }
            ]
        })

        res.json({
            message: 'Pedido atualizado com sucesso',
            pedido: pedidoAtualizado
        })

    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error)
        res.status(500).json({ error: 'Erro ao atualizar pedido' })
    }
}

// Buscar pedido por ID (admin - pode ver qualquer pedido)
const buscarPedidoPorIdAdmin = async (req, res) => {
    try {
        const { id } = req.params

        const pedido = await Pedido.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: 'usuarioPedido',
                    attributes: ['codUsuario', 'nome', 'email', 'telefone']
                },
                {
                    model: ItemPedido,
                    as: 'itensPedido',
                    include: [{
                        model: Produto,
                        as: 'produtoItem'
                    }]
                },
                {
                    model: Endereco,
                    as: 'enderecoEntrega'
                },
                {
                    model: Entrega,
                    as: 'entregaPedido'
                }
            ]
        })

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' })
        }

        res.json(pedido)

    } catch (error) {
        console.error('Erro ao buscar pedido (admin):', error)
        res.status(500).json({ error: 'Erro ao buscar pedido' })
    }
}

// Reembolsar pedido (admin)
const reembolsarPedido = async (req, res) => {
    try {
        const { id } = req.params
        const { motivoReembolso, valorReembolso } = req.body

        const pedido = await Pedido.findByPk(id, {
            include: [{
                model: ItemPedido,
                as: 'itensPedido'
            }]
        })

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' })
        }

        // Verificar se pedido pode ser reembolsado
        if (!['PAGO', 'ENVIADO', 'ENTREGUE'].includes(pedido.status)) {
            return res.status(400).json({ error: 'Pedido não pode ser reembolsado' })
        }

        // Devolver itens ao estoque
        for (const item of pedido.itensPedido) {
            const estoque = await Estoque.findOne({
                where: { idProduto: item.idProduto }
            })
            if (estoque) {
                estoque.quantidade_atual += item.quantidade
                await estoque.save()
            }
        }

        // Atualizar status
        pedido.status = 'REEMBOLSADO'
        await pedido.save()

        // Atualizar entrega
        await Entrega.update(
            { statusEntrega: 'DEVOLVIDO' },
            { where: { idPedido: pedido.codPedido } }
        )

        res.json({
            message: 'Pedido reembolsado com sucesso',
            pedido
        })

    } catch (error) {
        console.error('Erro ao reembolsar pedido:', error)
        res.status(500).json({ error: 'Erro ao reembolsar pedido' })
    }
}

// Buscar pedidos por usuário (admin)
const buscarPedidosPorUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params

        const pedidos = await Pedido.findAll({
            where: { idUsuario },
            include: [
                {
                    model: ItemPedido,
                    as: 'itensPedido',
                    include: [{
                        model: Produto,
                        as: 'produtoItem'
                    }]
                },
                {
                    model: Endereco,
                    as: 'enderecoEntrega'
                },
                {
                    model: Entrega,
                    as: 'entregaPedido'
                }
            ],
            order: [['dataPedido', 'DESC']]
        })

        res.json(pedidos)

    } catch (error) {
        console.error('Erro ao buscar pedidos por usuário:', error)
        res.status(500).json({ error: 'Erro ao buscar pedidos' })
    }
}

// Atualizar pedido (usuário pode modificar antes do pagamento)
const atualizarPedido = async (req, res) => {
    try {
        const { id } = req.params
        const {
            itens, // Array de { idProduto, quantidade }
            idEndereco,
            metodoPagamento,
            cupomDesconto
        } = req.body

        const pedido = await Pedido.findOne({
            where: {
                codPedido: id,
                idUsuario: req.userId
            },
            include: [{
                model: ItemPedido,
                as: 'itensPedido'
            }]
        })

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' })
        }

        // Verificar se pedido pode ser atualizado
        if (!['PENDENTE_PAGAMENTO'].includes(pedido.status)) {
            return res.status(400).json({ error: 'Pedido não pode ser modificado' })
        }

        // Se itens foram fornecidos, recalcular pedido
        if (itens && Array.isArray(itens) && itens.length > 0) {
            // Devolver itens atuais ao estoque
            for (const item of pedido.itensPedido) {
                const estoque = await Estoque.findOne({
                    where: { idProduto: item.idProduto }
                })
                if (estoque) {
                    estoque.quantidade_atual += item.quantidade
                    await estoque.save()
                }
            }

            // Remover itens antigos
            await ItemPedido.destroy({
                where: { idPedido: pedido.codPedido }
            })

            // Recalcular com novos itens
            let valorSubtotal = 0
            const itensPedido = []

            for (const item of itens) {
                const produto = await Produto.findByPk(item.idProduto)

                if (!produto) {
                    return res.status(404).json({ error: `Produto ${item.idProduto} não encontrado` })
                }

                if (!produto.ativo) {
                    return res.status(400).json({ error: `Produto ${produto.nome} não está disponível` })
                }

                const estoque = await Estoque.findOne({
                    where: { idProduto: produto.codProduto }
                })

                if (estoque && estoque.quantidade_atual < item.quantidade) {
                    return res.status(400).json({
                        error: `Estoque insuficiente para ${produto.nome}. Disponível: ${estoque.quantidade_atual}`
                    })
                }

                const valorItem = parseFloat(produto.preco) * item.quantidade
                valorSubtotal += valorItem

                itensPedido.push({
                    idPedido: pedido.codPedido,
                    idProduto: produto.codProduto,
                    quantidade: item.quantidade,
                    precoUnitario: produto.preco,
                    valorTotalItem: valorItem
                })
            }

            // Criar novos itens
            for (const item of itensPedido) {
                await ItemPedido.create(item)

                // Atualizar estoque
                const estoque = await Estoque.findOne({
                    where: { idProduto: item.idProduto }
                })
                if (estoque) {
                    estoque.quantidade_atual -= item.quantidade
                    await estoque.save()
                }
            }

            // Recalcular valores
            const valorFrete = 50.00
            let valorDesconto = 0
            if (cupomDesconto) {
                valorDesconto = valorSubtotal * 0.1
            }

            pedido.valorSubtotal = valorSubtotal
            pedido.valorFrete = valorFrete
            pedido.valorTotal = valorSubtotal + valorFrete - valorDesconto
        }

        // Atualizar outros campos
        if (idEndereco) {
            const endereco = await Endereco.findOne({
                where: {
                    codEndereco: idEndereco,
                    idUsuario: req.userId
                }
            })
            if (!endereco) {
                return res.status(404).json({ error: 'Endereço não encontrado' })
            }
            pedido.idEndereco = idEndereco
        }

        if (metodoPagamento) {
            pedido.metodoPagamento = metodoPagamento
        }

        await pedido.save()

        // Buscar pedido atualizado
        const pedidoAtualizado = await Pedido.findByPk(pedido.codPedido, {
            include: [
                {
                    model: ItemPedido,
                    as: 'itensPedido',
                    include: [{
                        model: Produto,
                        as: 'produtoItem'
                    }]
                },
                {
                    model: Endereco,
                    as: 'enderecoEntrega'
                },
                {
                    model: Entrega,
                    as: 'entregaPedido'
                }
            ]
        })

        res.json({
            message: 'Pedido atualizado com sucesso',
            pedido: pedidoAtualizado
        })

    } catch (error) {
        console.error('Erro ao atualizar pedido:', error)
        res.status(500).json({ error: 'Erro ao atualizar pedido', details: error.message })
    }
}

// Listar pedidos por status (admin)
const listarPedidosPorStatus = async (req, res) => {
    try {
        const { status } = req.params

        const pedidos = await Pedido.findAll({
            where: { status },
            include: [
                {
                    model: Usuario,
                    as: 'usuarioPedido',
                    attributes: ['codUsuario', 'nome', 'email']
                },
                {
                    model: ItemPedido,
                    as: 'itensPedido',
                    include: [{
                        model: Produto,
                        as: 'produtoItem'
                    }]
                },
                {
                    model: Endereco,
                    as: 'enderecoEntrega'
                },
                {
                    model: Entrega,
                    as: 'entregaPedido'
                }
            ],
            order: [['dataPedido', 'DESC']]
        })

        res.json({
            status,
            total: pedidos.length,
            pedidos
        })

    } catch (error) {
        console.error('Erro ao listar pedidos por status:', error)
        res.status(500).json({ error: 'Erro ao listar pedidos' })
    }
}

// Estatísticas de pedidos (admin)
const obterEstatisticasPedidos = async (req, res) => {
    try {
        const { periodo } = req.query // 'hoje', 'semana', 'mes', 'ano'

        let dataInicio = new Date()

        switch (periodo) {
            case 'hoje':
                dataInicio.setHours(0, 0, 0, 0)
                break
            case 'semana':
                dataInicio.setDate(dataInicio.getDate() - 7)
                break
            case 'mes':
                dataInicio.setMonth(dataInicio.getMonth() - 1)
                break
            case 'ano':
                dataInicio.setFullYear(dataInicio.getFullYear() - 1)
                break
            default:
                dataInicio = null
        }

        const where = dataInicio ? { dataPedido: { [Op.gte]: dataInicio } } : {}

        const [totalPedidos, pedidosPagos, pedidosPendentes, pedidosCancelados, receitaTotal] = await Promise.all([
            Pedido.count({ where }),
            Pedido.count({ where: { ...where, status: 'PAGO' } }),
            Pedido.count({ where: { ...where, status: 'PENDENTE_PAGAMENTO' } }),
            Pedido.count({ where: { ...where, status: { [Op.in]: ['CANCELADO', 'REEMBOLSADO'] } } }),
            Pedido.sum('valorTotal', { where: { ...where, status: 'PAGO' } })
        ])

        res.json({
            periodo: periodo || 'todos',
            estatisticas: {
                totalPedidos,
                pedidosPagos,
                pedidosPendentes,
                pedidosCancelados,
                receitaTotal: receitaTotal || 0,
                taxaConversao: totalPedidos > 0 ? ((pedidosPagos / totalPedidos) * 100).toFixed(2) : 0
            }
        })

    } catch (error) {
        console.error('Erro ao obter estatísticas:', error)
        res.status(500).json({ error: 'Erro ao obter estatísticas' })
    }
}

module.exports = {
    criarPedido,
    listarPedidosUsuario,
    buscarPedidoPorId,
    cancelarPedido,
    listarTodosPedidos,
    atualizarStatusPedido,
    buscarPedidoPorIdAdmin,
    reembolsarPedido,
    buscarPedidosPorUsuario,
    atualizarPedido,
    listarPedidosPorStatus,
    obterEstatisticasPedidos
}
