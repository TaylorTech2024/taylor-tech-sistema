const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: 'Nao autenticado.' });

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Sessao invalida ou expirada.' });
  }
}

function autorizar(modulo) {
  return (req, res, next) => {
    const usuario = req.usuario;
    if (!usuario) return res.status(401).json({ erro: 'Nao autenticado.' });
    if (usuario.cargo === 'Dono' || usuario.permissoes.includes(modulo)) return next();
    return res.status(403).json({ erro: 'Sem permissao para este modulo.' });
  };
}

module.exports = { autenticar, autorizar };
