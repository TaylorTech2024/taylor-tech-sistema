const pool = require('../config/db');

exports.resumo = async (req, res) => {
  const [[totais]] = await pool.query(
    `SELECT
        COALESCE(SUM(valor_entrada), 0) AS faturamento,
        COALESCE(SUM(custo_peca), 0) AS custo_total,
        COALESCE(SUM(lucro), 0) AS lucro_liquido,
        COUNT(*) AS total_os
     FROM financeiro`
  );

  const faturamento = Number(totais.faturamento);
  const lucroLiquido = Number(totais.lucro_liquido);
  const margem = faturamento > 0 ? Number(((lucroLiquido / faturamento) * 100).toFixed(2)) : 0;

  res.json({
    faturamento,
    custo_total: Number(totais.custo_total),
    lucro_liquido: lucroLiquido,
    margem_percentual: margem,
    total_os: Number(totais.total_os)
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
