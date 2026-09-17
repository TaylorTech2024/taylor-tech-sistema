document.getElementById('anoAtual').textContent = new Date().getFullYear();

const marcaSelect = document.getElementById('marca');
const modeloSelect = document.getElementById('modelo');
const servicoSelect = document.getElementById('servico');
const valorServicoEl = document.getElementById('valorServico');
const formOrcamento = document.getElementById('formOrcamento');
const btnEnviar = document.getElementById('btnEnviar');

let whatsappEmpresa = '';

function resetSelect(select, placeholder, disabled = true) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  select.disabled = disabled;
}

function atualizarPrecoPlaceholder() {
  valorServicoEl.textContent = 'selecione o serviço';
  valorServicoEl.classList.add('placeholder');
}

async function carregarConfig() {
  try {
    const cfg = await api.config();
    whatsappEmpresa = cfg.whatsapp || '';
    const link = whatsappEmpresa
      ? `https://wa.me/${whatsappEmpresa}?text=${encodeURIComponent('Olá! Vim pelo site da Taylor Tech e quero um orçamento.')}`
      : '#';
    ['linkWhatsTopo', 'linkWhatsHero', 'whatsFab'].forEach((id) => {
      document.getElementById(id).href = link;
    });
  } catch (err) {
    console.error('Falha ao carregar configuracao', err);
  }
}

async function carregarMarcas() {
  try {
    const marcas = await api.catalogo.marcas();
    marcaSelect.innerHTML = '<option value="">Selecione a marca...</option>';
    marcas.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      marcaSelect.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}

marcaSelect.addEventListener('change', async () => {
  resetSelect(modeloSelect, 'Carregando modelos...', true);
  resetSelect(servicoSelect, 'Selecione o modelo primeiro...', true);
  atualizarPrecoPlaceholder();

  const marca = marcaSelect.value;
  if (!marca) {
    resetSelect(modeloSelect, 'Selecione a marca primeiro...', true);
    return;
  }

  try {
    const modelos = await api.catalogo.modelos(marca);
    modeloSelect.innerHTML = '<option value="">Selecione o modelo...</option>';
    modelos.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      modeloSelect.appendChild(opt);
    });
    modeloSelect.disabled = false;
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Ops!', text: 'Não foi possível carregar os modelos.', customClass: swalClasses() });
  }
});

modeloSelect.addEventListener('change', async () => {
  resetSelect(servicoSelect, 'Carregando serviços...', true);
  atualizarPrecoPlaceholder();

  const marca = marcaSelect.value;
  const modelo = modeloSelect.value;
  if (!modelo) {
    resetSelect(servicoSelect, 'Selecione o modelo primeiro...', true);
    return;
  }

  try {
    const servicos = await api.catalogo.servicos(marca, modelo);
    servicoSelect.innerHTML = '<option value="">Selecione o serviço...</option>';
    servicos.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.peca_id;
      opt.textContent = `${s.servico}${!s.disponivel ? ' (sob consulta)' : ''}`;
      opt.dataset.valor = s.valor;
      opt.dataset.servico = s.servico;
      servicoSelect.appendChild(opt);
    });
    servicoSelect.disabled = servicos.length === 0;
    if (servicos.length === 0) {
      servicoSelect.innerHTML = '<option value="">Nenhum serviço disponível para este modelo</option>';
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Ops!', text: 'Não foi possível carregar os serviços.', customClass: swalClasses() });
  }
});

servicoSelect.addEventListener('change', () => {
  const opt = servicoSelect.selectedOptions[0];
  if (!opt || !opt.dataset.valor) {
    atualizarPrecoPlaceholder();
    return;
  }
  valorServicoEl.textContent = formatarMoeda(opt.dataset.valor);
  valorServicoEl.classList.remove('placeholder');
});

function swalClasses() {
  return {
    popup: 'taylor-swal',
    confirmButton: 'btn taylor-swal-confirm',
    cancelButton: 'btn taylor-swal-cancel'
  };
}

function validarWhatsapp(valor) {
  const digitos = valor.replace(/\D/g, '');
  return digitos.length >= 10 && digitos.length <= 13;
}

formOrcamento.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  const marca = marcaSelect.value;
  const modelo = modeloSelect.value;
  const servicoOpt = servicoSelect.selectedOptions[0];
  const pecaId = servicoSelect.value;

  if (!nome || nome.length < 3) {
    return Swal.fire({ icon: 'warning', title: 'Nome inválido', text: 'Informe seu nome completo.', customClass: swalClasses() });
  }
  if (!validarWhatsapp(whatsapp)) {
    return Swal.fire({ icon: 'warning', title: 'WhatsApp inválido', text: 'Informe um número de WhatsApp válido com DDD.', customClass: swalClasses() });
  }
  if (!marca || !modelo || !pecaId) {
    return Swal.fire({ icon: 'warning', title: 'Faltam informações', text: 'Selecione marca, modelo e serviço.', customClass: swalClasses() });
  }

  const valor = formatarMoeda(servicoOpt.dataset.valor);
  const servicoNome = servicoOpt.dataset.servico;

  const confirmado = await Swal.fire({
    icon: 'question',
    title: 'Confirmar orçamento?',
    html: `<b>${marca} ${modelo}</b><br>${servicoNome}<br><span style="color:#39ff14;font-size:1.3rem;font-weight:800">${valor}</span>`,
    showCancelButton: true,
    confirmButtonText: 'Confirmar e enviar',
    cancelButtonText: 'Voltar',
    customClass: swalClasses()
  });

  if (!confirmado.isConfirmed) return;

  btnEnviar.disabled = true;
  btnEnviar.innerHTML = '<span class="spinner"></span> Enviando...';

  try {
    const resultado = await api.pedidos.criar({ nome, whatsapp, marca, modelo, peca_id: pecaId });

    const mensagem = `Olá! Meu nome é ${nome}.\nSolicitei o orçamento #${resultado.os_id} pelo site:\n` +
      `Aparelho: ${marca} ${modelo}\nServiço: ${servicoNome}\nValor: ${valor}\n\nGostaria de agendar a entrega do aparelho.`;

    await Swal.fire({
      icon: 'success',
      title: 'Pedido registrado!',
      text: 'Você será direcionado para o WhatsApp para confirmar o atendimento.',
      customClass: swalClasses(),
      confirmButtonText: 'Ir para o WhatsApp'
    });

    const link = whatsappEmpresa
      ? `https://wa.me/${whatsappEmpresa}?text=${encodeURIComponent(mensagem)}`
      : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(link, '_blank');

    formOrcamento.reset();
    resetSelect(modeloSelect, 'Selecione a marca primeiro...', true);
    resetSelect(servicoSelect, 'Selecione o modelo primeiro...', true);
    atualizarPrecoPlaceholder();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erro ao enviar', text: err.message, customClass: swalClasses() });
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Solicitar e enviar no WhatsApp';
  }
});

// Efeito "hover magnetico" nos botoes .magnetic
document.querySelectorAll('.magnetic').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.error('SW falhou:', err));
  });
}

carregarConfig();
carregarMarcas();
