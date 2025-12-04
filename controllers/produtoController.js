// controllers/produtoController.js

const Produto = require("../models/Produto");
const Estoque = require("../models/Estoque");

// Buscar todos os produtos
exports.listarProdutos = async (req, res) => {
  try {
    // ❗ Removido o filtro { ativo: true }
    const produtos = await Produto.findAll();

    res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
};

// Buscar produto por ID
exports.buscarProdutoPorId = async (req, res) => {
  try {
    const produto = await Produto.findByPk(req.params.id);

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.status(200).json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
};

// Criar produto
exports.criarProduto = async (req, res) => {
  try {
    const novoProduto = await Produto.create(req.body);
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
};

// Atualizar produto
exports.atualizarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByPk(req.params.id);

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    await produto.update(req.body);
    res.status(200).json(produto);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
};

// Deletar produto
exports.deletarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByPk(req.params.id);

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    await produto.destroy();
    res.status(200).json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ error: "Erro ao deletar produto" });
  }
};

// Listar produtos para admin
exports.listarProdutosAdmin = async (req, res) => {
  try {
    const produtos = await Produto.findAll();

    res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos para admin:", error);
    res.status(500).json({ error: "Erro ao buscar produtos para admin" });
  }
};

// Atualizar estoque
exports.atualizarEstoque = async (req, res) => {
  try {
    const produto = await Produto.findByPk(req.params.id);

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const { quantidade_atual } = req.body;
    if (quantidade_atual === undefined) {
      return res.status(400).json({ error: "Quantidade atual é obrigatória" });
    }

    // Verificar se já existe estoque para o produto
    let estoque = await Estoque.findOne({ where: { idProduto: req.params.id } });

    if (estoque) {
      // Atualizar estoque existente
      await estoque.update({ quantidade_atual });
    } else {
      // Criar novo estoque
      estoque = await Estoque.create({ idProduto: req.params.id, quantidade_atual });
    }

    res.status(200).json({ produto, estoque });
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error);
    res.status(500).json({ error: "Erro ao atualizar estoque" });
  }
};

