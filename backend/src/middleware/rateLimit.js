const rateLimit = require('express-rate-limit');

// Login: poucas tentativas por IP, pra dificultar forca-bruta de senha.
exports.limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.' }
});

// Pedidos publicos (vitrine): evita spam de OS falsas e flood de notificacoes push.
exports.limitePedidos = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitos pedidos em pouco tempo. Aguarde alguns minutos e tente novamente.' }
});
