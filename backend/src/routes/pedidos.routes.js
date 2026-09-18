const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const { limitePedidos } = require('../middleware/rateLimit');

router.post('/', limitePedidos, pedidosController.criarPedido);

module.exports = router;
