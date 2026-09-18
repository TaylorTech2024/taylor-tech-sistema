const pool = require('../config/db');

exports.resumo = async (req, res) => {
  const [[entradas]] = await pool.query(
    `SELECT
        COALESCE(SUM(valor_entrada), 0) AS faturamento,
        COALESCE(SUM(custo_peca), 0) AS custo_total,
        COALESCE(SUM(lucro), 0) AS lucro_bruto,
        COUNT(*) AS total_os
     FROM financeiro`
  );
  const [[despesas]] = await pool.query(
    `SELECT COALESCE(SUM(valor), 0) AS total FROM financeiro_despesas`
  );
  const [[aReceber]] = await pool.query(
    `SELECT COALESCE(SUM(valor), 0) AS total FROM contas_receber WHERE status = 'pendente'`
  );

  const faturamento = Number(entradas.faturamento);
  const custoTotal = Number(entradas.custo_total);
  const despesasTotal = Number(despesas.total);
  const lucroLiquido = Number((Number(entradas.lucro_bruto) - despesasTotal).toFixed(2));
  const margem = faturamento > 0 ? Number(((lucroLiquido / faturamento) * 100).toFixed(2)) : 0;

  res.json({
    faturamento,
    custo_total: custoTotal,
    despesas_total: despesasTotal,
    lucro_liquido: lucroLiquido,
    margem_percentual: margem,
    a_receber_total: Number(aReceber.total),
    total_os: Number(entradas.total_os)
  });
};

exports.listar = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.os_id, f.descricao, f.valor_entrada, f.custo_peca, f.lucro, f.criado_em,
            os.aparelho_marca, os.aparelho_modelo, c.nome AS cliente_nome
     FROM financeiro f
     JOIN ordens_servico os ON os.id = f.os_id
     JOIN clientes c ON c.id = os.cliente_id
     ORDER BY f.criado_em DESC`
  );
  res.json(rows);
};

/* ------------------------- Despesas (Saidas) ------------------------- */

exports.listarDespesas = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, descricao, valor, data_despesa, criado_em FROM financeiro_despesas ORDER BY data_despesa DESC`
  );
  res.json(rows);
};

exports.criarDespesa = async (req, res) => {
  const { descricao, valor, data_despesa } = req.body;
  if (!descricao || !valor || !data_despesa) {
    return res.status(400).json({ erro: 'Preencha descricao, valor e data.' });
  }
  const [result] = await pool.query(
    `INSERT INTO financeiro_despesas (descricao, valor, data_despesa) VALUES (?, ?, ?)`,
    [descricao, valor, data_despesa]
  );
  res.status(201).json({ id: result.insertId });
};

exports.removerDespesa = async (req, res) => {
  const { id } = req.params;
  await pool.query(`DELETE FROM financeiro_despesas WHERE id = ?`, [id]);
  res.json({ ok: true });
};

/* ------------------------- Contas a Receber ------------------------- */

exports.listarContasReceber = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT cr.id, cr.descricao, cr.valor, cr.data_vencimento, cr.status, cr.criado_em, cr.recebido_em,
            c.id AS cliente_id, c.nome AS cliente_nome, c.whatsapp AS cliente_whatsapp
     FROM contas_receber cr
     JOIN clientes c ON c.id = cr.cliente_id
     ORDER BY cr.status ASC, cr.data_vencimento ASC`
  );
  res.json(rows);
};

exports.criarContaReceber = async (req, res) => {
  const { cliente_id, descricao, valor, data_vencimento } = req.body;
  if (!cliente_id || !descricao || !valor || !data_vencimento) {
    return res.status(400).json({ erro: 'Preencha cliente, descricao, valor e vencimento.' });
  }
  const [result] = await pool.query(
    `INSERT INTO contas_receber (cliente_id, descricao, valor, data_vencimento) VALUES (?, ?, ?, ?)`,
    [cliente_id, descricao, valor, data_vencimento]
  );
  res.status(201).json({ id: result.insertId });
};

exports.marcarRecebido = async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `UPDATE contas_receber SET status = 'recebido', recebido_em = NOW() WHERE id = ?`,
    [id]
  );
  res.json({ ok: true });
};
