const router = require('express').Router();
const pushController = require('../controllers/pushController');

router.get('/chave-publica', pushController.chavePublica);
router.post('/inscrever', pushController.inscrever);
router.post('/desinscrever', pushController.desinscrever);

module.exports = router;
