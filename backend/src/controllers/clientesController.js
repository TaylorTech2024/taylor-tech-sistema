const pool = require('../config/db');

exports.listar = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.nome, c.whatsapp, c.criado_em,
            COALESCE(SUM(CASE WHEN os.status = 'concluido' THEN os.valor_cobrado ELSE 0 END), 0) AS total_gasto,
            COUNT(CASE WHEN os.status = 'concluido' THEN 1 ELSE NULL END) AS aparelhos_reparados,
            COUNT(os.id) AS total_os
     FROM clientes c
     LEFT JOIN ordens_servico os ON os.cliente_id = c.id
     GROUP BY c.id, c.nome, c.whatsapp, c.criado_em
     ORDER BY total_gasto DESC`
  );
  res.json(rows);
};

exports.buscarPorId = async (req, res) => {
  const { id } = req.params;
  const [clienteRows] = await pool.query(`SELECT * FROM clientes WHERE id = ?`, [id]);
  if (clienteRows.length === 0) return res.status(404).json({ erro: 'Cliente nao encontrado.' });

  const [ordens] = await pool.query(
    `SELECT id, aparelho_marca, aparelho_modelo, servico_descricao, valor_cobrado, status, criado_em
     FROM ordens_servico WHERE cliente_id = ? ORDER BY criado_em DESC`,
    [id]
  );

  res.json({ ...clienteRows[0], ordens });
};
