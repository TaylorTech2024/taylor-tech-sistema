const express = require('express');
const router = express.Router();
const ordensController = require('../controllers/ordensController');

router.get('/', ordensController.listar);
router.get('/:id', ordensController.buscarPorId);
router.post('/', ordensController.criarManual);
router.put('/:id', ordensController.atualizarStatus);
router.put('/:id/concluir', ordensController.concluir);
router.put('/:id/cancelar', ordensController.cancelar);

module.exports = router;
