const pool = require('../config/db');
const { precoFinal, obterConfiguracoes } = require('../data/margens');

// Cria (ou reaproveita) o cliente pelo whatsapp e abre uma OS pendente
// vinda da vitrine publica (index.html).
exports.criarPedido = async (req, res) => {
  const { nome, whatsapp, marca, modelo, peca_id } = req.body;

  if (!nome || !whatsapp || !marca || !modelo || !peca_id) {
    return res.status(400).json({ erro: 'Preencha nome, whatsapp, marca, modelo e servico.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [pecaRows] = await conn.query(
      `SELECT id, nome_peca, categoria, preco_custo FROM estoque WHERE id = ? AND ativo = 1`,
      [peca_id]
    );
    if (pecaRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Servico/peca nao encontrado.' });
    }
    const peca = pecaRows[0];
    const { margens } = await obterConfiguracoes();
    const valorCobrado = precoFinal(peca.preco_custo, peca.categoria, margens);

    const whatsappLimpo = String(whatsapp).replace(/\D/g, '');

    let clienteId;
    const [clienteExistente] = await conn.query(
      `SELECT id FROM clientes WHERE whatsapp = ?`,
      [whatsappLimpo]
    );
    if (clienteExistente.length > 0) {
      clienteId = clienteExistente[0].id;
      await conn.query(`UPDATE clientes SET nome = ? WHERE id = ?`, [nome, clienteId]);
    } else {
      const [novoCliente] = await conn.query(
        `INSERT INTO clientes (nome, whatsapp) VALUES (?, ?)`,
        [nome, whatsappLimpo]
      );
      clienteId = novoCliente.insertId;
    }

    const [osResult] = await conn.query(
      `INSERT INTO ordens_servico
        (cliente_id, aparelho_marca, aparelho_modelo, peca_id, servico_descricao, valor_cobrado, status, origem)
       VALUES (?, ?, ?, ?, ?, ?, 'pendente', 'site')`,
      [clienteId, marca, modelo, peca.id, peca.nome_peca, valorCobrado]
    );

    await conn.commit();

    res.status(201).json({
      os_id: osResult.insertId,
      cliente: nome,
      aparelho: `${marca} ${modelo}`,
      servico: peca.nome_peca,
      valor: valorCobrado
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar pedido.' });
  } finally {
    conn.release();
  }
};
