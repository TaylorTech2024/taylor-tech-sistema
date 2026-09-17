const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklistController');

router.get('/itens-padrao', checklistController.itensPadrao);
router.get('/:osId', checklistController.buscarPorOs);
router.post('/:osId', checklistController.salvar);

module.exports = router;
