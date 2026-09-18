const pool = require('../config/db');
const { precoFinal, obterConfiguracoes } = require('../data/margens');

exports.listar = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, nome_peca, marca, modelo, categoria, qualidade, preco_custo, preco_venda_manual,
            quantidade, estoque_minimo, ativo
     FROM estoque
     ORDER BY marca ASC, modelo ASC, categoria ASC`
  );

  const { margens } = await obterConfiguracoes();

  const dados = rows.map((r) => ({
    ...r,
    preco_final: precoFinal(r, margens),
    preco_manual: r.preco_venda_manual != null,
    estoque_baixo: r.quantidade <= r.estoque_minimo
  }));

  res.json(dados);
};

exports.criar = async (req, res) => {
  const { nome_peca, marca, modelo, categoria, qualidade, preco_custo, preco_venda_manual, quantidade, estoque_minimo } = req.body;
  const categoriasValidas = ['bateria', 'tela_lcd', 'tela_oled', 'outro'];

  if (!nome_peca || !marca || !modelo || !categoriasValidas.includes(categoria) || preco_custo == null) {
    return res.status(400).json({ erro: 'Dados invalidos para cadastro de peca.' });
  }

  const [result] = await pool.query(
    `INSERT INTO estoque (nome_peca, marca, modelo, categoria, qualidade, preco_custo, preco_venda_manual, quantidade, estoque_minimo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome_peca, marca, modelo, categoria, qualidade || null, preco_custo, preco_venda_manual || null, quantidade || 0, estoque_minimo || 3]
  );
  res.status(201).json({ id: result.insertId });
};

exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome_peca, marca, modelo, categoria, qualidade, preco_custo, preco_venda_manual, quantidade, estoque_minimo, ativo } = req.body;

  await pool.query(
    `UPDATE estoque SET
      nome_peca = COALESCE(?, nome_peca),
      marca = COALESCE(?, marca),
      modelo = COALESCE(?, modelo),
      categoria = COALESCE(?, categoria),
      qualidade = ?,
      preco_custo = COALESCE(?, preco_custo),
      preco_venda_manual = ?,
      quantidade = COALESCE(?, quantidade),
      estoque_minimo = COALESCE(?, estoque_minimo),
      ativo = COALESCE(?, ativo)
     WHERE id = ?`,
    [nome_peca, marca, modelo, categoria, qualidade || null, preco_custo, preco_venda_manual || null, quantidade, estoque_minimo, ativo, id]
  );
  res.json({ ok: true });
};

exports.remover = async (req, res) => {
  const { id } = req.params;
  await pool.query(`UPDATE estoque SET ativo = 0 WHERE id = ?`, [id]);
  res.json({ ok: true });
};
