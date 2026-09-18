const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');

router.get('/resumo', financeiroController.resumo);
router.get('/', financeiroController.listar);

router.get('/despesas', financeiroController.listarDespesas);
router.post('/despesas', financeiroController.criarDespesa);
router.delete('/despesas/:id', financeiroController.removerDespesa);

router.get('/contas-receber', financeiroController.listarContasReceber);
router.post('/contas-receber', financeiroController.criarContaReceber);
router.put('/contas-receber/:id/receber', financeiroController.marcarRecebido);

module.exports = router;
