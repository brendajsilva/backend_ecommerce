// controllers/produtoController.js

const Produto = require("../models/Produto");

// Buscar todos os produtos
exports.getAll = async (req, res) => {
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
exports.getById = async (req, res) => {
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
exports.create = async (req, res) => {
  try {
    const novoProduto = await Produto.create(req.body);
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
};

// Atualizar produto
exports.update = async (req, res) => {
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
exports.delete = async (req, res) => {
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


module.exports = {
    listarProdutos,
    listarProdutosAdmin,
    buscarProdutoPorId,
    criarProduto,
    atualizarProduto,
    deletarProduto,
    atualizarEstoque
}
