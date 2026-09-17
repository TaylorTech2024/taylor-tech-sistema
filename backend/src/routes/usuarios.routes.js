const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { autenticar, autorizar } = require('../middleware/auth');

router.use(autenticar, autorizar('equipe'));

router.get('/', usuariosController.listar);
router.post('/', usuariosController.criar);
router.put('/:id', usuariosController.atualizar);
router.delete('/:id', usuariosController.remover);

module.exports = router;
