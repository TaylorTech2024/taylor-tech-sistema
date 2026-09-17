const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/auth');

function normalizarPermissoes(permissoes) {
  if (Array.isArray(permissoes)) return permissoes;
  if (typeof permissoes === 'string') return JSON.parse(permissoes);
  return [];
}

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Informe email e senha.' });

  const [rows] = await pool.query(`SELECT * FROM usuarios WHERE email = ? AND ativo = 1`, [email]);
  if (rows.length === 0) return res.status(401).json({ erro: 'Email ou senha invalidos.' });

  const usuario = rows[0];
  const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaOk) return res.status(401).json({ erro: 'Email ou senha invalidos.' });

  const payload = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cargo: usuario.cargo,
    permissoes: normalizarPermissoes(usuario.permissoes)
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({ token, usuario: payload });
};

exports.me = (req, res) => {
  res.json(req.usuario);
};
