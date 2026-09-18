/* =====================================================================
   AUTENTICACAO E PERMISSOES
===================================================================== */
if (!localStorage.getItem('tt_token')) {
  window.location.href = '/login.html';
}

const usuarioAtual = JSON.parse(localStorage.getItem('tt_usuario') || 'null') || { cargo: '', permissoes: [] };

function temPermissao(modulo) {
  return usuarioAtual.cargo === 'Dono' || usuarioAtual.permissoes.includes(modulo);
}

document.getElementById('anoAtualAdmin').textContent = new Date().getFullYear();
document.getElementById('usuarioLogadoNome').textContent = usuarioAtual.nome || '';
document.getElementById('usuarioLogadoCargo').textContent = usuarioAtual.cargo || '';

document.querySelectorAll('.nav-item').forEach((item) => {
  if (!temPermissao(item.dataset.modulo)) item.style.display = 'none';
});

document.getElementById('btnSair').addEventListener('click', () => {
  localStorage.removeItem('tt_token');
  localStorage.removeItem('tt_usuario');
  window.location.href = '/login.html';
});

/* =====================================================================
   MENU GAVETA (MOBILE)
===================================================================== */
const sidebarEl = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function abrirMenu() {
  sidebarEl.classList.add('open');
  sidebarOverlay.classList.add('open');
}
function fecharMenu() {
  sidebarEl.classList.remove('open');
  sidebarOverlay.classList.remove('open');
}

document.getElementById('btnHamburger').addEventListener('click', abrirMenu);
sidebarOverlay.addEventListener('click', fecharMenu);
document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', fecharMenu));

function swalClasses() {
  return {
    popup: 'taylor-swal',
    confirmButton: 'btn taylor-swal-confirm',
    cancelButton: 'btn taylor-swal-cancel'
  };
}

const STATUS_LABEL = {
  pendente: { label: 'Pendente', badge: 'badge-warning' },
  em_andamento: { label: 'Em Andamento', badge: 'badge-muted' },
  concluido: { label: 'Concluído', badge: 'badge-ok' },
  cancelado: { label: 'Cancelado', badge: 'badge-danger' }
};

const CATEGORIA_LABEL = {
  bateria: 'Bateria',
  tela_lcd: 'Tela LCD',
  tela_oled: 'Tela OLED',
  outro: 'Outro'
};

/* =====================================================================
   NAVEGACAO (SPA)
===================================================================== */
const CARREGADORES_VIEW = {
  ordens: carregarOrdens,
  checklist: carregarSelectChecklistOs,
  financeiro: carregarFinanceiro,
  estoque: carregarEstoque,
  clientes: carregarClientes,
  equipe: carregarEquipe,
  configuracoes: carregarConfiguracoes
};

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((i) => i.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    item.classList.add('active');
    const viewId = item.dataset.view;
    document.getElementById(`view-${viewId}`).classList.add('active');
    const carregar = CARREGADORES_VIEW[viewId];
    if (carregar) carregar();
  });
});

/* =====================================================================
   ORDENS DE SERVICO
===================================================================== */
async function carregarOrdens() {
  const grid = document.getElementById('osGrid');
  grid.innerHTML = '<div class="empty-state"><span class="spinner"></span></div>';

  const status = document.getElementById('filtroStatus').value;
  try {
    const ordens = await api.ordens.listar(status);
    if (ordens.length === 0) {
      grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i>Nenhuma ordem de serviço encontrada.</div>';
      return;
    }
    grid.innerHTML = '';
    ordens.forEach((os) => grid.appendChild(criarOsCard(os)));
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Erro ao carregar: ${err.message}</div>`;
  }
}

function criarOsCard(os) {
  const div = document.createElement('div');
  div.className = 'card os-card';
  const st = STATUS_LABEL[os.status] || STATUS_LABEL.pendente;

  const whatsLink = `https://wa.me/${os.cliente_whatsapp}?text=${encodeURIComponent(
    `Olá ${os.cliente_nome}! Aqui é da Taylor Tech, sobre a OS #${os.id} (${os.aparelho_marca} ${os.aparelho_modelo} - ${os.servico_descricao}).`
  )}`;

  div.innerHTML = `
    <div class="os-top">
      <div>
        <h3>#${os.id} - ${os.aparelho_marca} ${os.aparelho_modelo}</h3>
        <div class="os-meta">${os.cliente_nome} · ${formatarData(os.criado_em)}</div>
      </div>
      <span class="badge ${st.badge}">${st.label}</span>
    </div>
    <div class="os-meta">${os.servico_descricao}</div>
    <div class="os-valor">${formatarMoeda(os.valor_cobrado)}</div>
    ${os.status === 'cancelado' && os.motivo_cancelamento
      ? `<div class="os-meta" style="color:var(--danger); font-style:italic;">Motivo: ${os.motivo_cancelamento}</div>`
      : ''}
    <div class="os-actions">
      <a class="btn btn-ghost btn-sm" href="${whatsLink}" target="_blank"><i class="fa-brands fa-whatsapp"></i> Chamar</a>
      ${os.status !== 'concluido' && os.status !== 'cancelado'
        ? `<button class="btn btn-primary btn-sm" data-acao="concluir" data-id="${os.id}"><i class="fa-solid fa-check"></i> Concluir</button>
           <button class="btn btn-danger btn-sm" data-acao="cancelar" data-id="${os.id}"><i class="fa-solid fa-ban"></i> Cancelar</button>`
        : ''}
    </div>
  `;

  const btnConcluir = div.querySelector('[data-acao="concluir"]');
  if (btnConcluir) btnConcluir.addEventListener('click', () => concluirOs(os.id));

  const btnCancelar = div.querySelector('[data-acao="cancelar"]');
  if (btnCancelar) btnCancelar.addEventListener('click', () => cancelarOs(os.id));

  return div;
}

async function cancelarOs(id) {
  const { value: motivo } = await Swal.fire({
    icon: 'warning',
    title: `Cancelar OS #${id}?`,
    input: 'textarea',
    inputLabel: 'Motivo do cancelamento (obrigatório)',
    inputPlaceholder: 'Ex: cliente desistiu, aparelho sem conserto, peça indisponível...',
    showCancelButton: true,
    confirmButtonText: 'Cancelar OS',
    cancelButtonText: 'Voltar',
    customClass: swalClasses(),
    inputValidator: (value) => (!value || !value.trim()) && 'Informe o motivo do cancelamento.'
  });
  if (!motivo) return;

  try {
    await api.ordens.cancelar(id, motivo);
    Swal.fire({ icon: 'success', title: 'OS cancelada.', customClass: swalClasses(), timer: 1600, showConfirmButton: false });
    carregarOrdens();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

async function concluirOs(id) {
  const confirmado = await Swal.fire({
    icon: 'question',
    title: `Concluir OS #${id}?`,
    text: 'Isso vai dar baixa no estoque da peça e lançar a entrada financeira automaticamente.',
    showCancelButton: true,
    confirmButtonText: 'Concluir OS',
    cancelButtonText: 'Cancelar',
    customClass: swalClasses()
  });
  if (!confirmado.isConfirmed) return;

  try {
    await api.ordens.concluir(id);
    Swal.fire({ icon: 'success', title: 'OS concluída!', customClass: swalClasses(), timer: 1600, showConfirmButton: false });
    carregarOrdens();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

document.getElementById('filtroStatus').addEventListener('change', carregarOrdens);
document.getElementById('btnAtualizarOs').addEventListener('click', carregarOrdens);

document.getElementById('btnNovaOs').addEventListener('click', abrirModalNovaOs);

async function abrirModalNovaOs() {
  const { value: form } = await Swal.fire({
    title: 'Nova OS Manual',
    customClass: swalClasses(),
    width: 480,
    html: `
      <div style="text-align:left; display:grid; gap:0.7rem;">
        <input id="manNome" class="swal2-input" placeholder="Nome do cliente" style="margin:0;width:100%;">
        <input id="manWhats" class="swal2-input" placeholder="WhatsApp (com DDD)" style="margin:0;width:100%;">
        <select id="manMarca" class="swal2-input" style="margin:0;width:100%;"><option value="">Marca...</option></select>
        <select id="manModelo" class="swal2-input" style="margin:0;width:100%;" disabled><option value="">Modelo...</option></select>
        <select id="manServico" class="swal2-input" style="margin:0;width:100%;" disabled><option value="">Serviço...</option></select>
        <input id="manObs" class="swal2-input" placeholder="Observações (opcional)" style="margin:0;width:100%;">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Criar OS',
    cancelButtonText: 'Cancelar',
    didOpen: async () => {
      const marcaEl = document.getElementById('manMarca');
      const modeloEl = document.getElementById('manModelo');
      const servicoEl = document.getElementById('manServico');

      const marcas = await api.catalogo.marcas();
      marcas.forEach((m) => marcaEl.insertAdjacentHTML('beforeend', `<option value="${m}">${m}</option>`));

      marcaEl.addEventListener('change', async () => {
        modeloEl.innerHTML = '<option value="">Modelo...</option>';
        servicoEl.innerHTML = '<option value="">Serviço...</option>';
        modeloEl.disabled = true; servicoEl.disabled = true;
        if (!marcaEl.value) return;
        const modelos = await api.catalogo.modelos(marcaEl.value);
        modelos.forEach((m) => modeloEl.insertAdjacentHTML('beforeend', `<option value="${m}">${m}</option>`));
        modeloEl.disabled = false;
      });

      modeloEl.addEventListener('change', async () => {
        servicoEl.innerHTML = '<option value="">Serviço...</option>';
        servicoEl.disabled = true;
        if (!modeloEl.value) return;
        const servicos = await api.catalogo.servicos(marcaEl.value, modeloEl.value);
        servicos.forEach((s) => {
          const opt = document.createElement('option');
          opt.value = s.peca_id;
          opt.textContent = `${s.servico} - ${formatarMoeda(s.valor)}`;
          opt.dataset.valor = s.valor;
          opt.dataset.descricao = s.descricao;
          servicoEl.appendChild(opt);
        });
        servicoEl.disabled = false;
      });
    },
    preConfirm: () => {
      const nome = document.getElementById('manNome').value.trim();
      const whatsapp = document.getElementById('manWhats').value.trim();
      const marca = document.getElementById('manMarca').value;
      const modelo = document.getElementById('manModelo').value;
      const servicoEl = document.getElementById('manServico');
      const servicoOpt = servicoEl.selectedOptions[0];
      const observacoes = document.getElementById('manObs').value.trim();

      if (!nome || !whatsapp || !marca || !modelo || !servicoEl.value) {
        Swal.showValidationMessage('Preencha todos os campos obrigatórios.');
        return false;
      }

      return {
        nome, whatsapp, aparelho_marca: marca, aparelho_modelo: modelo,
        peca_id: servicoEl.value, servico_descricao: servicoOpt.dataset.descricao,
        valor_cobrado: servicoOpt.dataset.valor, observacoes
      };
    }
  });

  if (!form) return;

  try {
    await api.ordens.criar(form);
    Swal.fire({ icon: 'success', title: 'OS criada!', customClass: swalClasses(), timer: 1600, showConfirmButton: false });
    carregarOrdens();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

/* =====================================================================
   CHECKLIST DE ENTRADA
===================================================================== */
async function carregarSelectChecklistOs() {
  const select = document.getElementById('checklistOsSelect');
  select.innerHTML = '<option value="">Carregando ordens...</option>';
  try {
    const ordens = await api.ordens.listar();
    select.innerHTML = '<option value="">Selecione uma OS...</option>';
    ordens.forEach((os) => {
      const opt = document.createElement('option');
      opt.value = os.id;
      opt.textContent = `#${os.id} - ${os.aparelho_marca} ${os.aparelho_modelo} - ${os.cliente_nome}`;
      select.appendChild(opt);
    });
  } catch (err) {
    select.innerHTML = `<option value="">Erro: ${err.message}</option>`;
  }
}

document.getElementById('checklistOsSelect').addEventListener('change', async (e) => {
  const osId = e.target.value;
  const container = document.getElementById('checklistContainer');
  if (!osId) { container.innerHTML = ''; return; }

  container.innerHTML = '<div class="empty-state"><span class="spinner"></span></div>';

  try {
    const [itensPadrao, salvos, os] = await Promise.all([
      api.checklist.itensPadrao(),
      api.checklist.buscar(osId),
      api.ordens.buscar(osId)
    ]);

    const mapaSalvos = {};
    salvos.forEach((s) => { mapaSalvos[s.item] = s; });

    const linhas = itensPadrao.map((item) => {
      const salvo = mapaSalvos[item];
      return { item, status: salvo ? salvo.status : 'nao_testado', observacao: salvo ? (salvo.observacao || '') : '' };
    });

    renderChecklist(osId, os, linhas);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Erro: ${err.message}</div>`;
  }
});

function renderChecklist(osId, os, linhas) {
  const container = document.getElementById('checklistContainer');

  const header = `
    <div class="card" style="padding:1.2rem 1.5rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem;">
      <div>
        <h3 style="margin-bottom:0.2rem;">OS #${osId} - ${os.aparelho_marca} ${os.aparelho_modelo}</h3>
        <span class="text-dim" style="font-size:0.85rem;">Cliente: ${os.cliente_nome} · ${os.servico_descricao}</span>
      </div>
      <div style="display:flex; gap:0.6rem;">
        <button class="btn btn-ghost btn-sm" id="btnImprimirChecklist"><i class="fa-solid fa-print"></i> Gerar Documento</button>
        <button class="btn btn-primary btn-sm" id="btnSalvarChecklist"><i class="fa-solid fa-floppy-disk"></i> Salvar Checklist</button>
      </div>
    </div>
  `;

  const linhasHtml = linhas.map((l, idx) => `
    <div class="card checklist-row" data-item="${l.item}">
      <div>
        <div class="item-name">${l.item}</div>
        <input type="text" class="obs-input" placeholder="Observação (opcional)" value="${l.observacao || ''}"
          style="margin-top:0.4rem; width:100%; background:transparent; border:1px solid var(--border); border-radius:8px; color:var(--text); padding:0.4rem 0.6rem; font-family:var(--font); font-size:0.8rem;">
      </div>
      <div class="status-toggle">
        <button type="button" class="status-btn" data-value="ok">OK</button>
        <button type="button" class="status-btn" data-value="atencao">Atenção</button>
        <button type="button" class="status-btn" data-value="nao_testado">Não Testado</button>
      </div>
    </div>
  `).join('');

  container.innerHTML = header + `<div class="checklist-panel">${linhasHtml}</div>`;

  // Marca o estado inicial dos botoes
  linhas.forEach((l) => {
    const row = container.querySelector(`.checklist-row[data-item="${l.item}"]`);
    row.querySelector(`.status-btn[data-value="${l.status}"]`).classList.add('active');
  });

  container.querySelectorAll('.checklist-row').forEach((row) => {
    row.querySelectorAll('.status-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.status-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  document.getElementById('btnSalvarChecklist').addEventListener('click', () => salvarChecklist(osId));
  document.getElementById('btnImprimirChecklist').addEventListener('click', () => imprimirChecklist(os, coletarChecklist()));
}

function coletarChecklist() {
  return Array.from(document.querySelectorAll('.checklist-row')).map((row) => {
    const ativo = row.querySelector('.status-btn.active');
    return {
      item: row.dataset.item,
      status: ativo ? ativo.dataset.value : 'nao_testado',
      observacao: row.querySelector('.obs-input').value.trim()
    };
  });
}

async function salvarChecklist(osId) {
  try {
    await api.checklist.salvar(osId, coletarChecklist());
    Swal.fire({ icon: 'success', title: 'Checklist salvo!', customClass: swalClasses(), timer: 1400, showConfirmButton: false });
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

function imprimirChecklist(os, itens) {
  const statusLabel = { ok: 'OK', atencao: 'Atenção', nao_testado: 'Não Testado' };
  const linhas = itens.map((i) => `
    <tr>
      <td style="padding:8px;border:1px solid #ccc;">${i.item}</td>
      <td style="padding:8px;border:1px solid #ccc;text-align:center;">${statusLabel[i.status]}</td>
      <td style="padding:8px;border:1px solid #ccc;">${i.observacao || '-'}</td>
    </tr>
  `).join('');

  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>Checklist OS #${os.id} - Taylor Tech</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
      h1 { margin-bottom: 4px; } h1 span { color: #1fae0a; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th { background: #111; color: #fff; padding: 8px; text-align: left; }
      .meta { color: #444; margin-bottom: 20px; }
      .assinatura { margin-top: 60px; display: flex; justify-content: space-between; }
      .assinatura div { width: 45%; border-top: 1px solid #333; text-align: center; padding-top: 6px; }
    </style></head><body>
      <h1>TAYLOR <span>TECH</span></h1>
      <p class="meta">Checklist de Entrada - OS #${os.id}<br>
      Cliente: ${os.cliente_nome} (${os.cliente_whatsapp})<br>
      Aparelho: ${os.aparelho_marca} ${os.aparelho_modelo}<br>
      Serviço: ${os.servico_descricao} · Data: ${new Date().toLocaleString('pt-BR')}</p>
      <table>
        <thead><tr><th>Item</th><th>Status</th><th>Observação</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>
      <div class="assinatura">
        <div>Assinatura do Cliente</div>
        <div>Assinatura do Técnico</div>
      </div>
      <script>window.onload = () => window.print();</script>
    </body></html>
  `);
  win.document.close();
}

/* =====================================================================
   FINANCEIRO
===================================================================== */
async function carregarFinanceiro() {
  try {
    const [resumo, lancamentos] = await Promise.all([api.financeiro.resumo(), api.financeiro.listar()]);

    document.getElementById('kpiFaturamento').textContent = formatarMoeda(resumo.faturamento);
    document.getElementById('kpiDespesas').textContent = formatarMoeda(resumo.despesas_total);
    document.getElementById('kpiLucro').textContent = formatarMoeda(resumo.lucro_liquido);
    document.getElementById('kpiMargem').textContent = `(${resumo.margem_percentual}%)`;
    document.getElementById('kpiAReceber').textContent = formatarMoeda(resumo.a_receber_total);

    const tbody = document.getElementById('financeiroTbody');
    tbody.innerHTML = lancamentos.length === 0
      ? '<tr><td colspan="7" class="empty-state">Nenhum lançamento ainda.</td></tr>'
      : lancamentos.map((l) => `
        <tr>
          <td>${formatarData(l.criado_em)}</td>
          <td>#${l.os_id}</td>
          <td>${l.cliente_nome}</td>
          <td>${l.aparelho_marca} ${l.aparelho_modelo} - ${l.descricao}</td>
          <td>${formatarMoeda(l.valor_entrada)}</td>
          <td>${formatarMoeda(l.custo_peca)}</td>
          <td class="text-neon">${formatarMoeda(l.lucro)}</td>
        </tr>
      `).join('');
  } catch (err) {
    console.error(err);
  }

  carregarDespesas();
  carregarContasReceber();
}

document.getElementById('btnAtualizarFinanceiro').addEventListener('click', carregarFinanceiro);

/* ------------------------- Despesas (Saidas) ------------------------- */
async function carregarDespesas() {
  const tbody = document.getElementById('despesasTbody');
  try {
    const despesas = await api.financeiro.despesas.listar();
    tbody.innerHTML = despesas.length === 0
      ? '<tr><td colspan="4" class="empty-state">Nenhuma despesa registrada.</td></tr>'
      : despesas.map((d) => `
        <tr>
          <td>${new Date(d.data_despesa).toLocaleDateString('pt-BR')}</td>
          <td>${d.descricao}</td>
          <td class="text-danger" style="color:var(--danger);">${formatarMoeda(d.valor)}</td>
          <td><button class="btn btn-danger btn-sm" data-acao="remover-despesa" data-id="${d.id}"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
      `).join('');

    tbody.querySelectorAll('[data-acao="remover-despesa"]').forEach((btn) =>
      btn.addEventListener('click', () => removerDespesa(Number(btn.dataset.id))));
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Erro: ${err.message}</td></tr>`;
  }
}

document.getElementById('btnNovaDespesa').addEventListener('click', async () => {
  const hoje = new Date().toISOString().slice(0, 10);
  const { value: dados } = await Swal.fire({
    title: 'Nova Despesa',
    customClass: swalClasses(),
    width: 420,
    html: `
      <div style="text-align:left; display:grid; gap:0.7rem;">
        <input id="despDescricao" class="swal2-input" style="margin:0;width:100%;" placeholder="Descrição (ex: Aluguel, Conta de luz)">
        <input id="despValor" type="number" step="0.01" class="swal2-input" style="margin:0;width:100%;" placeholder="Valor (R$)">
        <input id="despData" type="date" class="swal2-input" style="margin:0;width:100%;" value="${hoje}">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Registrar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const descricao = document.getElementById('despDescricao').value.trim();
      const valor = Number(document.getElementById('despValor').value);
      const data_despesa = document.getElementById('despData').value;
      if (!descricao || !valor || !data_despesa) {
        Swal.showValidationMessage('Preencha todos os campos.');
        return false;
      }
      return { descricao, valor, data_despesa };
    }
  });
  if (!dados) return;

  try {
    await api.financeiro.despesas.criar(dados);
    Swal.fire({ icon: 'success', title: 'Despesa registrada!', customClass: swalClasses(), timer: 1400, showConfirmButton: false });
    carregarFinanceiro();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
});

async function removerDespesa(id) {
  const confirmado = await Swal.fire({
    icon: 'warning',
    title: 'Remover despesa?',
    showCancelButton: true,
    confirmButtonText: 'Remover',
    cancelButtonText: 'Cancelar',
    customClass: swalClasses()
  });
  if (!confirmado.isConfirmed) return;

  try {
    await api.financeiro.despesas.remover(id);
    carregarFinanceiro();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

/* ------------------------- Contas a Receber ------------------------- */
async function carregarContasReceber() {
  const tbody = document.getElementById('contasReceberTbody');
  try {
    const contas = await api.financeiro.contasReceber.listar();
    tbody.innerHTML = contas.length === 0
      ? '<tr><td colspan="6" class="empty-state">Nenhuma conta a receber.</td></tr>'
      : contas.map((c) => {
        const badge = c.status === 'recebido'
          ? '<span class="badge badge-ok">Recebido</span>'
          : '<span class="badge badge-warning">Pendente</span>';
        return `
          <tr>
            <td>${c.cliente_nome}</td>
            <td>${c.descricao}</td>
            <td>${formatarMoeda(c.valor)}</td>
            <td>${new Date(c.data_vencimento).toLocaleDateString('pt-BR')}</td>
            <td>${badge}</td>
            <td>${c.status === 'pendente'
              ? `<button class="btn btn-primary btn-sm" data-acao="receber" data-id="${c.id}"><i class="fa-solid fa-check"></i> Recebido</button>`
              : ''}</td>
          </tr>
        `;
      }).join('');

    tbody.querySelectorAll('[data-acao="receber"]').forEach((btn) =>
      btn.addEventListener('click', () => marcarRecebido(Number(btn.dataset.id))));
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Erro: ${err.message}</td></tr>`;
  }
}

document.getElementById('btnNovaContaReceber').addEventListener('click', async () => {
  let clientes = [];
  try {
    clientes = await api.clientes.listar();
  } catch (err) {
    return Swal.fire({ icon: 'error', title: 'Erro ao carregar clientes', text: err.message, customClass: swalClasses() });
  }
  if (clientes.length === 0) {
    return Swal.fire({ icon: 'info', title: 'Nenhum cliente cadastrado ainda.', customClass: swalClasses() });
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const { value: dados } = await Swal.fire({
    title: 'Nova Conta a Receber',
    customClass: swalClasses(),
    width: 420,
    html: `
      <div style="text-align:left; display:grid; gap:0.7rem;">
        <select id="crCliente" class="swal2-input" style="margin:0;width:100%;">
          <option value="">Selecione o cliente...</option>
          ${clientes.map((c) => `<option value="${c.id}">${c.nome} (${c.whatsapp})</option>`).join('')}
        </select>
        <input id="crDescricao" class="swal2-input" style="margin:0;width:100%;" placeholder="Descrição (ex: 2ª parcela do reparo)">
        <input id="crValor" type="number" step="0.01" class="swal2-input" style="margin:0;width:100%;" placeholder="Valor (R$)">
        <input id="crVencimento" type="date" class="swal2-input" style="margin:0;width:100%;" value="${hoje}">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Registrar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const cliente_id = document.getElementById('crCliente').value;
      const descricao = document.getElementById('crDescricao').value.trim();
      const valor = Number(document.getElementById('crValor').value);
      const data_vencimento = document.getElementById('crVencimento').value;
      if (!cliente_id || !descricao || !valor || !data_vencimento) {
        Swal.showValidationMessage('Preencha todos os campos.');
        return false;
      }
      return { cliente_id, descricao, valor, data_vencimento };
    }
  });
  if (!dados) return;

  try {
    await api.financeiro.contasReceber.criar(dados);
    Swal.fire({ icon: 'success', title: 'Conta registrada!', customClass: swalClasses(), timer: 1400, showConfirmButton: false });
    carregarFinanceiro();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
});

async function marcarRecebido(id) {
  try {
    await api.financeiro.contasReceber.marcarRecebido(id);
    carregarFinanceiro();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

/* =====================================================================
   ESTOQUE
===================================================================== */
let estoqueCache = [];

async function carregarEstoque() {
  const tbody = document.getElementById('estoqueTbody');
  tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><span class="spinner"></span></td></tr>';

  try {
    estoqueCache = await api.estoque.listar();
    renderEstoque(estoqueCache);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Erro: ${err.message}</td></tr>`;
  }
}

function renderEstoque(lista) {
  const tbody = document.getElementById('estoqueTbody');
  const alertaBox = document.getElementById('estoqueAlertaBox');

  const baixos = lista.filter((p) => p.ativo && p.estoque_baixo);
  alertaBox.innerHTML = baixos.length > 0
    ? `<div class="stock-alert-banner"><i class="fa-solid fa-triangle-exclamation"></i> ${baixos.length} peça(s) com estoque baixo ou zerado.</div>`
    : '';

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-state">Nenhuma peça cadastrada.</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map((p) => {
    const badge = !p.ativo
      ? '<span class="badge badge-muted">Inativa</span>'
      : p.quantidade === 0
        ? '<span class="badge badge-danger">Sem estoque</span>'
        : p.estoque_baixo
          ? '<span class="badge badge-warning">Estoque baixo</span>'
          : '<span class="badge badge-ok">OK</span>';

    return `
      <tr>
        <td>${p.nome_peca}</td>
        <td>${p.marca}</td>
        <td>${p.modelo}</td>
        <td>${CATEGORIA_LABEL[p.categoria] || p.categoria}</td>
        <td>${p.qualidade || '—'}</td>
        <td>${formatarMoeda(p.preco_custo)}</td>
        <td class="text-neon">${formatarMoeda(p.preco_final)}${p.preco_manual ? ' <span class="badge badge-warning" style="margin-left:0.3rem;">Manual</span>' : ''}</td>
        <td>${p.quantidade}</td>
        <td>${badge}</td>
        <td>
          <button class="btn btn-ghost btn-sm" data-acao="editar" data-id="${p.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" data-acao="remover" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-acao="editar"]').forEach((btn) =>
    btn.addEventListener('click', () => abrirModalEditarPeca(Number(btn.dataset.id))));
  tbody.querySelectorAll('[data-acao="remover"]').forEach((btn) =>
    btn.addEventListener('click', () => removerPeca(Number(btn.dataset.id))));
}

document.getElementById('filtroEstoque').addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase();
  const filtrado = estoqueCache.filter((p) =>
    `${p.nome_peca} ${p.marca} ${p.modelo}`.toLowerCase().includes(termo));
  renderEstoque(filtrado);
});

function formularioPecaHtml(peca = {}) {
  const categorias = Object.entries(CATEGORIA_LABEL);
  return `
    <div style="text-align:left; display:grid; gap:0.7rem;">
      <input id="pecaNome" class="swal2-input" style="margin:0;width:100%;" placeholder="Nome da peça" value="${peca.nome_peca || ''}">
      <input id="pecaMarca" class="swal2-input" style="margin:0;width:100%;" placeholder="Marca" value="${peca.marca || ''}">
      <input id="pecaModelo" class="swal2-input" style="margin:0;width:100%;" placeholder="Modelo" value="${peca.modelo || ''}">
      <select id="pecaCategoria" class="swal2-input" style="margin:0;width:100%;">
        ${categorias.map(([v, l]) => `<option value="${v}" ${peca.categoria === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <input id="pecaQualidade" class="swal2-input" style="margin:0;width:100%;" placeholder="Qualidade (ex: Original, AAA, Compatível)" value="${peca.qualidade || ''}">
      <input id="pecaCusto" type="number" step="0.01" class="swal2-input" style="margin:0;width:100%;" placeholder="Preço de custo (R$)" value="${peca.preco_custo || ''}">
      <input id="pecaPrecoManual" type="number" step="0.01" class="swal2-input" style="margin:0;width:100%;" placeholder="Preço final manual (R$) — deixe vazio p/ calcular automático" value="${peca.preco_venda_manual ?? ''}">
      <input id="pecaQtd" type="number" class="swal2-input" style="margin:0;width:100%;" placeholder="Quantidade em estoque" value="${peca.quantidade ?? ''}">
      <input id="pecaMin" type="number" class="swal2-input" style="margin:0;width:100%;" placeholder="Estoque mínimo" value="${peca.estoque_minimo ?? 3}">
    </div>
  `;
}

document.getElementById('btnNovaPeca').addEventListener('click', async () => {
  const { value: dados } = await Swal.fire({
    title: 'Nova Peça',
    customClass: swalClasses(),
    width: 480,
    html: formularioPecaHtml(),
    showCancelButton: true,
    confirmButtonText: 'Cadastrar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => lerFormularioPeca()
  });
  if (!dados) return;

  try {
    await api.estoque.criar(dados);
    Swal.fire({ icon: 'success', title: 'Peça cadastrada!', customClass: swalClasses(), timer: 1400, showConfirmButton: false });
    carregarEstoque();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
});

function lerFormularioPeca() {
  const nome_peca = document.getElementById('pecaNome').value.trim();
  const marca = document.getElementById('pecaMarca').value.trim();
  const modelo = document.getElementById('pecaModelo').value.trim();
  const categoria = document.getElementById('pecaCategoria').value;
  const qualidade = document.getElementById('pecaQualidade').value.trim();
  const preco_custo = Number(document.getElementById('pecaCusto').value);
  const precoManualStr = document.getElementById('pecaPrecoManual').value;
  const preco_venda_manual = precoManualStr === '' ? null : Number(precoManualStr);
  const quantidade = Number(document.getElementById('pecaQtd').value || 0);
  const estoque_minimo = Number(document.getElementById('pecaMin').value || 3);

  if (!nome_peca || !marca || !modelo || !preco_custo) {
    Swal.showValidationMessage('Preencha nome, marca, modelo e preço de custo.');
    return false;
  }
  return { nome_peca, marca, modelo, categoria, qualidade, preco_custo, preco_venda_manual, quantidade, estoque_minimo };
}

async function abrirModalEditarPeca(id) {
  const peca = estoqueCache.find((p) => p.id === id);
  if (!peca) return;

  const { value: dados } = await Swal.fire({
    title: `Editar Peça #${id}`,
    customClass: swalClasses(),
    width: 480,
    html: formularioPecaHtml(peca),
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => lerFormularioPeca()
  });
  if (!dados) return;

  try {
    await api.estoque.atualizar(id, dados);
    Swal.fire({ icon: 'success', title: 'Peça atualizada!', customClass: swalClasses(), timer: 1400, showConfirmButton: false });
    carregarEstoque();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

async function removerPeca(id) {
  const confirmado = await Swal.fire({
    icon: 'warning',
    title: 'Remover peça?',
    text: 'A peça será desativada e não aparecerá mais no catálogo do cliente.',
    showCancelButton: true,
    confirmButtonText: 'Remover',
    cancelButtonText: 'Cancelar',
    customClass: swalClasses()
  });
  if (!confirmado.isConfirmed) return;

  try {
    await api.estoque.remover(id);
    carregarEstoque();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

/* =====================================================================
   CLIENTES
===================================================================== */
let clientesCache = [];

async function carregarClientes() {
  const tbody = document.getElementById('clientesTbody');
  tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><span class="spinner"></span></td></tr>';

  try {
    clientesCache = await api.clientes.listar();
    renderClientes(clientesCache);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Erro: ${err.message}</td></tr>`;
  }
}

function renderClientes(lista) {
  const tbody = document.getElementById('clientesTbody');
  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum cliente cadastrado ainda.</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map((c) => `
    <tr>
      <td>${c.nome}</td>
      <td>${c.whatsapp}</td>
      <td>${c.aparelhos_reparados}</td>
      <td class="text-neon">${formatarMoeda(c.total_gasto)}</td>
      <td>${formatarData(c.criado_em)}</td>
    </tr>
  `).join('');
}

document.getElementById('filtroClientes').addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase();
  renderClientes(clientesCache.filter((c) => `${c.nome} ${c.whatsapp}`.toLowerCase().includes(termo)));
});

/* =====================================================================
   EQUIPE
===================================================================== */
const MODULOS_PERMISSAO = [
  { valor: 'ordens', label: 'Ordens de Serviço e Checklist' },
  { valor: 'financeiro', label: 'Financeiro' },
  { valor: 'estoque', label: 'Estoque' },
  { valor: 'clientes', label: 'Clientes' },
  { valor: 'equipe', label: 'Equipe (gestão de acessos)' },
  { valor: 'configuracoes', label: 'Configurações (mão de obra e garantia)' }
];

let equipeCache = [];

async function carregarEquipe() {
  const tbody = document.getElementById('equipeTbody');
  tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><span class="spinner"></span></td></tr>';

  try {
    equipeCache = await api.usuarios.listar();
    renderEquipe();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Erro: ${err.message}</td></tr>`;
  }
}

function renderEquipe() {
  const tbody = document.getElementById('equipeTbody');
  if (equipeCache.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhuma pessoa cadastrada.</td></tr>';
    return;
  }

  tbody.innerHTML = equipeCache.map((u) => {
    const permissoes = Array.isArray(u.permissoes) ? u.permissoes : JSON.parse(u.permissoes || '[]');
    const permissoesLabel = u.cargo === 'Dono'
      ? 'Acesso total'
      : (permissoes.map((p) => MODULOS_PERMISSAO.find((m) => m.valor === p)?.label || p).join(', ') || '—');
    const badge = u.ativo ? '<span class="badge badge-ok">Ativo</span>' : '<span class="badge badge-muted">Inativo</span>';

    return `
      <tr>
        <td>${u.nome}</td>
        <td>${u.email}</td>
        <td>${u.cargo}</td>
        <td style="max-width:320px;">${permissoesLabel}</td>
        <td>${badge}</td>
        <td>
          <button class="btn btn-ghost btn-sm" data-acao="editar-pessoa" data-id="${u.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" data-acao="remover-pessoa" data-id="${u.id}"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-acao="editar-pessoa"]').forEach((btn) =>
    btn.addEventListener('click', () => abrirModalPessoa(Number(btn.dataset.id))));
  tbody.querySelectorAll('[data-acao="remover-pessoa"]').forEach((btn) =>
    btn.addEventListener('click', () => removerPessoa(Number(btn.dataset.id))));
}

function formularioPessoaHtml(pessoa = {}) {
  const permissoesAtuais = Array.isArray(pessoa.permissoes) ? pessoa.permissoes : JSON.parse(pessoa.permissoes || '[]');
  const cargos = ['Dono', 'Gerente', 'Tecnico', 'Atendente'];

  return `
    <div style="text-align:left; display:grid; gap:0.7rem;">
      <input id="pessoaNome" class="swal2-input" style="margin:0;width:100%;" placeholder="Nome completo" value="${pessoa.nome || ''}">
      <input id="pessoaEmail" type="email" class="swal2-input" style="margin:0;width:100%;" placeholder="E-mail de acesso" value="${pessoa.email || ''}">
      <input id="pessoaSenha" type="password" class="swal2-input" style="margin:0;width:100%;" placeholder="${pessoa.id ? 'Nova senha (deixe em branco para manter)' : 'Senha'}">
      <select id="pessoaCargo" class="swal2-input" style="margin:0;width:100%;">
        ${cargos.map((c) => `<option value="${c}" ${pessoa.cargo === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      <div style="text-align:left; font-size:0.82rem; color:var(--text-dim); margin-top:0.4rem;">Módulos liberados (ignorado se o cargo for "Dono"):</div>
      <div id="pessoaPermissoes" style="text-align:left; display:grid; gap:0.4rem;">
        ${MODULOS_PERMISSAO.map((m) => `
          <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem;">
            <input type="checkbox" value="${m.valor}" ${permissoesAtuais.includes(m.valor) ? 'checked' : ''}> ${m.label}
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function lerFormularioPessoa(exigirSenha) {
  const nome = document.getElementById('pessoaNome').value.trim();
  const email = document.getElementById('pessoaEmail').value.trim();
  const senha = document.getElementById('pessoaSenha').value;
  const cargo = document.getElementById('pessoaCargo').value;
  const permissoes = Array.from(document.querySelectorAll('#pessoaPermissoes input:checked')).map((c) => c.value);

  if (!nome || !email || (exigirSenha && !senha)) {
    Swal.showValidationMessage('Preencha nome, e-mail e senha.');
    return false;
  }

  const dados = { nome, email, cargo, permissoes };
  if (senha) dados.senha = senha;
  return dados;
}

document.getElementById('btnNovaPessoa').addEventListener('click', async () => {
  const { value: dados } = await Swal.fire({
    title: 'Nova Pessoa',
    customClass: swalClasses(),
    width: 480,
    html: formularioPessoaHtml(),
    showCancelButton: true,
    confirmButtonText: 'Cadastrar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => lerFormularioPessoa(true)
  });
  if (!dados) return;

  try {
    await api.usuarios.criar(dados);
    Swal.fire({ icon: 'success', title: 'Pessoa cadastrada!', customClass: swalClasses(), timer: 1400, showConfirmButton: false });
    carregarEquipe();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
});

async function abrirModalPessoa(id) {
  const pessoa = equipeCache.find((u) => u.id === id);
  if (!pessoa) return;

  const { value: dados } = await Swal.fire({
    title: `Editar ${pessoa.nome}`,
    customClass: swalClasses(),
    width: 480,
    html: formularioPessoaHtml(pessoa),
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => lerFormularioPessoa(false)
  });
  if (!dados) return;

  try {
    await api.usuarios.atualizar(id, dados);
    Swal.fire({ icon: 'success', title: 'Dados atualizados!', customClass: swalClasses(), timer: 1400, showConfirmButton: false });
    carregarEquipe();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

async function removerPessoa(id) {
  const confirmado = await Swal.fire({
    icon: 'warning',
    title: 'Desativar acesso?',
    text: 'Essa pessoa nao vai conseguir mais entrar no painel.',
    showCancelButton: true,
    confirmButtonText: 'Desativar',
    cancelButtonText: 'Cancelar',
    customClass: swalClasses()
  });
  if (!confirmado.isConfirmed) return;

  try {
    await api.usuarios.remover(id);
    carregarEquipe();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
}

/* =====================================================================
   CONFIGURACOES
===================================================================== */
async function carregarConfiguracoes() {
  try {
    const config = await api.configuracoes.obter();
    document.getElementById('cfgMargemBateria').value = config.margens.bateria;
    document.getElementById('cfgMargemTelaLcd').value = config.margens.tela_lcd;
    document.getElementById('cfgMargemTelaOled').value = config.margens.tela_oled;
    document.getElementById('cfgMargemOutro').value = config.margens.outro;
    document.getElementById('cfgGarantiaDias').value = config.garantia_dias;
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro ao carregar configurações', text: err.message, customClass: swalClasses() });
  }
}

document.getElementById('formConfiguracoes').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dados = {
    margem_bateria: Number(document.getElementById('cfgMargemBateria').value),
    margem_tela_lcd: Number(document.getElementById('cfgMargemTelaLcd').value),
    margem_tela_oled: Number(document.getElementById('cfgMargemTelaOled').value),
    margem_outro: Number(document.getElementById('cfgMargemOutro').value),
    garantia_dias: Number(document.getElementById('cfgGarantiaDias').value)
  };

  try {
    await api.configuracoes.atualizar(dados);
    Swal.fire({ icon: 'success', title: 'Configurações salvas!', text: 'Os novos valores já valem para a vitrine e o painel.', customClass: swalClasses(), timer: 1800, showConfirmButton: false });
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro', text: err.message, customClass: swalClasses() });
  }
});

/* =====================================================================
   INICIALIZACAO
===================================================================== */
const primeiroNavVisivel = Array.from(document.querySelectorAll('.nav-item'))
  .find((item) => item.style.display !== 'none');

if (primeiroNavVisivel) {
  primeiroNavVisivel.classList.add('active');
  document.getElementById(`view-${primeiroNavVisivel.dataset.view}`).classList.add('active');
  const carregar = CARREGADORES_VIEW[primeiroNavVisivel.dataset.view];
  if (carregar) carregar();
}
