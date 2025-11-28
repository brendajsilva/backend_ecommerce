const express = require('express');
const router = express.Router();
const { enviarMensagemContato } = require('../controllers/contatoController');

// Rota para enviar mensagem de contato
router.post('/', enviarMensagemContato);

module.exports = router;