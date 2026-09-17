const bcrypt = require('bcryptjs');
const pool = require('../config/db');

exports.listar = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, nome, email, cargo, permissoes, ativo, criado_em FROM usuarios ORDER BY nome ASC`
  );
  res.json(rows);
};

exports.criar = async (req, res) => {
  const { nome, email, senha, cargo, permissoes } = req.body;
  if (!nome || !email || !senha || !cargo || !Array.isArray(permissoes)) {
    return res.status(400).json({ erro: 'Preencha nome, email, senha, cargo e permissoes.' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  try {
    const [result] = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, cargo, permissoes) VALUES (?, ?, ?, ?, ?)`,
      [nome, email, senhaHash, cargo, JSON.stringify(permissoes)]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Ja existe um usuario com esse email.' });
    }
    throw err;
  }
};

exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, cargo, permissoes, ativo } = req.body;

  const campos = [];
  const valores = [];
  if (nome) { campos.push('nome = ?'); valores.push(nome); }
  if (email) { campos.push('email = ?'); valores.push(email); }
  if (cargo) { campos.push('cargo = ?'); valores.push(cargo); }
  if (Array.isArray(permissoes)) { campos.push('permissoes = ?'); valores.push(JSON.stringify(permissoes)); }
  if (ativo !== undefined) { campos.push('ativo = ?'); valores.push(ativo ? 1 : 0); }
  if (senha) { campos.push('senha_hash = ?'); valores.push(await bcrypt.hash(senha, 10)); }

  if (campos.length === 0) return res.status(400).json({ erro: 'Nada para atualizar.' });

  valores.push(id);
  await pool.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);
  res.json({ ok: true });
};

exports.remover = async (req, res) => {
  const { id } = req.params;
  await pool.query(`UPDATE usuarios SET ativo = 0 WHERE id = ?`, [id]);
  res.json({ ok: true });
};
