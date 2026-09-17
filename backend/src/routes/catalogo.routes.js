const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');

router.get('/marcas', catalogoController.listarMarcas);
router.get('/modelos', catalogoController.listarModelos);
router.get('/servicos', catalogoController.listarServicos);

module.exports = router;
