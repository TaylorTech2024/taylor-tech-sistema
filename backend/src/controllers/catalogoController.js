const pool = require('../config/db');
const { precoFinal, obterConfiguracoes } = require('../data/margens');

const LABEL_CATEGORIA = {
  bateria: 'Troca de Bateria',
  tela_lcd: 'Troca de Tela (LCD)',
  tela_oled: 'Troca de Tela (OLED)',
  outro: 'Reparo'
};

exports.listarMarcas = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT marca FROM estoque WHERE ativo = 1 ORDER BY marca ASC`
  );
  res.json(rows.map((r) => r.marca));
};

exports.listarModelos = async (req, res) => {
  const { marca } = req.query;
  if (!marca) return res.status(400).json({ erro: 'Parametro "marca" e obrigatorio.' });

  const [rows] = await pool.query(
    `SELECT DISTINCT modelo FROM estoque WHERE ativo = 1 AND marca = ? ORDER BY modelo ASC`,
    [marca]
  );
  res.json(rows.map((r) => r.modelo));
};

exports.listarServicos = async (req, res) => {
  const { marca, modelo } = req.query;
  if (!marca || !modelo) {
    return res.status(400).json({ erro: 'Parametros "marca" e "modelo" sao obrigatorios.' });
  }

  const [rows] = await pool.query(
    `SELECT id, nome_peca, categoria, qualidade, preco_custo, preco_venda_manual, quantidade
     FROM estoque
     WHERE ativo = 1 AND marca = ? AND modelo = ?
     ORDER BY categoria ASC`,
    [marca, modelo]
  );

  const { margens } = await obterConfiguracoes();

  const servicos = rows.map((peca) => ({
    peca_id: peca.id,
    servico: LABEL_CATEGORIA[peca.categoria] || LABEL_CATEGORIA.outro,
    descricao: peca.nome_peca,
    qualidade: peca.qualidade,
    categoria: peca.categoria,
    valor: precoFinal(peca, margens),
    disponivel: peca.quantidade > 0
  }));

  res.json(servicos);
};
