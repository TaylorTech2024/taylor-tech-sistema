const pool = require('../config/db');

exports.listar = async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status) {
    where = 'WHERE os.status = ?';
    params.push(status);
  } else {
    // Sem filtro explicito ("Todas"): esconde as canceladas, que ficam
    // visiveis so quando o usuario escolhe o filtro "Canceladas".
    where = "WHERE os.status != 'cancelado'";
  }

  const [rows] = await pool.query(
    `SELECT os.id, os.aparelho_marca, os.aparelho_modelo, os.servico_descricao,
            os.valor_cobrado, os.status, os.origem, os.observacoes, os.motivo_cancelamento,
            os.criado_em, os.concluido_em,
            c.id AS cliente_id, c.nome AS cliente_nome, c.whatsapp AS cliente_whatsapp
     FROM ordens_servico os
     JOIN clientes c ON c.id = os.cliente_id
     ${where}
     ORDER BY os.criado_em DESC`,
    params
  );
  res.json(rows);
};

exports.buscarPorId = async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT os.*, c.nome AS cliente_nome, c.whatsapp AS cliente_whatsapp
     FROM ordens_servico os
     JOIN clientes c ON c.id = os.cliente_id
     WHERE os.id = ?`,
    [id]
  );
  if (rows.length === 0) return res.status(404).json({ erro: 'OS nao encontrada.' });
  res.json(rows[0]);
};

// Criacao manual de OS pelo admin (ex.: cliente atendido no balcao).
exports.criarManual = async (req, res) => {
  const { nome, whatsapp, aparelho_marca, aparelho_modelo, peca_id, servico_descricao, valor_cobrado, observacoes } = req.body;

  if (!nome || !whatsapp || !aparelho_marca || !aparelho_modelo || !servico_descricao || valor_cobrado == null) {
    return res.status(400).json({ erro: 'Campos obrigatorios faltando.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const whatsappLimpo = String(whatsapp).replace(/\D/g, '');

    let clienteId;
    const [clienteExistente] = await conn.query(`SELECT id FROM clientes WHERE whatsapp = ?`, [whatsappLimpo]);
    if (clienteExistente.length > 0) {
      clienteId = clienteExistente[0].id;
    } else {
      const [novoCliente] = await conn.query(`INSERT INTO clientes (nome, whatsapp) VALUES (?, ?)`, [nome, whatsappLimpo]);
      clienteId = novoCliente.insertId;
    }

    const [osResult] = await conn.query(
      `INSERT INTO ordens_servico
        (cliente_id, aparelho_marca, aparelho_modelo, peca_id, servico_descricao, valor_cobrado, status, origem, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, 'pendente', 'manual', ?)`,
      [clienteId, aparelho_marca, aparelho_modelo, peca_id || null, servico_descricao, valor_cobrado, observacoes || null]
    );

    await conn.commit();
    res.status(201).json({ os_id: osResult.insertId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar OS.' });
  } finally {
    conn.release();
  }
};

exports.atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status, observacoes } = req.body;
  const permitidos = ['pendente', 'em_andamento', 'concluido', 'cancelado'];
  if (status && !permitidos.includes(status)) {
    return res.status(400).json({ erro: 'Status invalido.' });
  }

  const campos = [];
  const valores = [];
  if (status) { campos.push('status = ?'); valores.push(status); }
  if (observacoes !== undefined) { campos.push('observacoes = ?'); valores.push(observacoes); }

  if (campos.length === 0) return res.status(400).json({ erro: 'Nada para atualizar.' });

  valores.push(id);
  await pool.query(`UPDATE ordens_servico SET ${campos.join(', ')} WHERE id = ?`, valores);
  res.json({ ok: true });
};

// Cancela a OS, exigindo um motivo (fica registrado para consulta futura).
exports.cancelar = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  if (!motivo || !motivo.trim()) {
    return res.status(400).json({ erro: 'Informe o motivo do cancelamento.' });
  }

  const [osRows] = await pool.query(`SELECT status FROM ordens_servico WHERE id = ?`, [id]);
  if (osRows.length === 0) return res.status(404).json({ erro: 'OS nao encontrada.' });
  if (osRows[0].status === 'concluido') {
    return res.status(409).json({ erro: 'Esta OS ja foi concluida e nao pode ser cancelada.' });
  }
  if (osRows[0].status === 'cancelado') {
    return res.status(409).json({ erro: 'Esta OS ja esta cancelada.' });
  }

  await pool.query(
    `UPDATE ordens_servico SET status = 'cancelado', motivo_cancelamento = ? WHERE id = ?`,
    [motivo.trim(), id]
  );
  res.json({ ok: true });
};

// Regra de negocio central: fechar a OS.
// Em uma unica transacao: (1) muda status para concluido, (2) da baixa
// no estoque da peca utilizada, (3) lanca a entrada financeira com o
// lucro real (valor cobrado - custo da peca).
exports.concluir = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [osRows] = await conn.query(
      `SELECT id, peca_id, servico_descricao, valor_cobrado, status FROM ordens_servico WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (osRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ erro: 'OS nao encontrada.' });
    }
    const os = osRows[0];
    if (os.status === 'concluido') {
      await conn.rollback();
      return res.status(409).json({ erro: 'Esta OS ja foi concluida.' });
    }

    let custoPeca = 0;

    if (os.peca_id) {
      const [pecaRows] = await conn.query(
        `SELECT id, preco_custo, quantidade FROM estoque WHERE id = ? FOR UPDATE`,
        [os.peca_id]
      );
      if (pecaRows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ erro: 'Peca vinculada a OS nao encontrada no estoque.' });
      }
      const peca = pecaRows[0];
      if (peca.quantidade <= 0) {
        await conn.rollback();
        return res.status(409).json({ erro: 'Sem estoque disponivel para essa peca.' });
      }
      custoPeca = Number(peca.preco_custo);

      await conn.query(`UPDATE estoque SET quantidade = quantidade - 1 WHERE id = ?`, [os.peca_id]);
    }

    await conn.query(
      `UPDATE ordens_servico SET status = 'concluido', concluido_em = NOW() WHERE id = ?`,
      [id]
    );

    const valorEntrada = Number(os.valor_cobrado);
    const lucro = Number((valorEntrada - custoPeca).toFixed(2));

    await conn.query(
      `INSERT INTO financeiro (os_id, descricao, valor_entrada, custo_peca, lucro)
       VALUES (?, ?, ?, ?, ?)`,
      [id, os.servico_descricao, valorEntrada, custoPeca, lucro]
    );

    await conn.commit();
    res.json({ ok: true, os_id: Number(id), lucro });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ erro: 'Erro ao concluir OS.' });
  } finally {
    conn.release();
  }
};
