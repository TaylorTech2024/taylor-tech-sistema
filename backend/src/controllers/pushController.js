const crypto = require('crypto');
const pool = require('../config/db');
const { VAPID_PUBLIC_KEY } = require('../utils/push');

exports.chavePublica = (req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(503).json({ erro: 'Notificacoes push nao configuradas no servidor.' });
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY });
};

exports.inscrever = async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return res.status(400).json({ erro: 'Inscricao de notificacao invalida.' });
  }
  const endpointHash = crypto.createHash('sha256').update(endpoint).digest('hex');

  await pool.query(
    `INSERT INTO push_subscriptions (usuario_id, endpoint, endpoint_hash, p256dh, auth)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE usuario_id = ?, p256dh = ?, auth = ?`,
    [req.usuario.id, endpoint, endpointHash, keys.p256dh, keys.auth, req.usuario.id, keys.p256dh, keys.auth]
  );
  res.status(201).json({ ok: true });
};

exports.desinscrever = async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ erro: 'Informe o endpoint da inscricao.' });
  const endpointHash = crypto.createHash('sha256').update(endpoint).digest('hex');
  await pool.query(`DELETE FROM push_subscriptions WHERE endpoint_hash = ?`, [endpointHash]);
  res.json({ ok: true });
};
