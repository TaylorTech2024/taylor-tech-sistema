const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');

router.get('/resumo', financeiroController.resumo);
router.get('/', financeiroController.listar);

module.exports = router;
