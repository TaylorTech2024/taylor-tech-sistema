const express = require('express');
const router = express.Router();
const configuracoesController = require('../controllers/configuracoesController');
const { autenticar, autorizar } = require('../middleware/auth');

router.use(autenticar, autorizar('configuracoes'));

router.get('/', configuracoesController.obter);
router.put('/', configuracoesController.atualizar);

module.exports = router;
