const pool = require('../config/db');

const ITENS_PADRAO = [
  'Tela', 'Touch', 'Camera Frontal', 'Camera Traseira', 'Audio/Alto-falante',
  'Microfone', 'Botoes', 'Conector de Carga', 'Bateria', 'Wi-Fi/Bluetooth',
  'Biometria/Face ID', 'Carcaca/Tampa'
];

exports.itensPadrao = (req, res) => {
  res.json(ITENS_PADRAO);
};

exports.buscarPorOs = async (req, res) => {
  const { osId } = req.params;
  const [rows] = await pool.query(
    `SELECT id, item, status, observacao FROM os_checklist WHERE os_id = ? ORDER BY id ASC`,
    [osId]
  );
  res.json(rows);
};

// Salva (upsert) o checklist inteiro de uma OS de uma vez.
exports.salvar = async (req, res) => {
  const { osId } = req.params;
  const { itens } = req.body; // [{ item, status, observacao }]

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: '"itens" deve ser uma lista nao vazia.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [osRows] = await conn.query(`SELECT id FROM ordens_servico WHERE id = ?`, [osId]);
    if (osRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ erro: 'OS nao encontrada.' });
    }

    for (const it of itens) {
      if (!it.item || !['ok', 'atencao', 'nao_testado'].includes(it.status)) continue;
      await conn.query(
        `INSERT INTO os_checklist (os_id, item, status, observacao)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), observacao = VALUES(observacao)`,
        [osId, it.item, it.status, it.observacao || null]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar checklist.' });
  } finally {
    conn.release();
  }
};
