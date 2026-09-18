const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');
const { limiteLogin } = require('../middleware/rateLimit');

router.post('/login', limiteLogin, authController.login);
router.get('/me', autenticar, authController.me);

module.exports = router;
