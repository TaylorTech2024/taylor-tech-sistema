const express = require('express');
const router = express.Router();
const estoqueController = require('../controllers/estoqueController');

router.get('/', estoqueController.listar);
router.post('/', estoqueController.criar);
router.put('/:id', estoqueController.atualizar);
router.delete('/:id', estoqueController.remover);

module.exports = router;
