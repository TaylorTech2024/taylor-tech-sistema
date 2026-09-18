const API_BASE = '/api';

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('tt_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options
  });

  let body = null;
  try { body = await res.json(); } catch (_) { /* resposta sem corpo */ }

  if (res.status === 401 && path !== '/auth/login') {
    localStorage.removeItem('tt_token');
    localStorage.removeItem('tt_usuario');
    window.location.href = '/login.html';
    return new Promise(() => {});
  }

  if (!res.ok) {
    const mensagem = (body && body.erro) || 'Erro inesperado ao comunicar com o servidor.';
    throw new Error(mensagem);
  }
  return body;
}

const api = {
  config: () => apiRequest('/config'),

  catalogo: {
    marcas: () => apiRequest('/catalogo/marcas'),
    modelos: (marca) => apiRequest(`/catalogo/modelos?marca=${encodeURIComponent(marca)}`),
    servicos: (marca, modelo) =>
      apiRequest(`/catalogo/servicos?marca=${encodeURIComponent(marca)}&modelo=${encodeURIComponent(modelo)}`)
  },

  pedidos: {
    criar: (dados) => apiRequest('/pedidos', { method: 'POST', body: JSON.stringify(dados) })
  },

  ordens: {
    listar: (status) => apiRequest(`/ordens${status ? `?status=${status}` : ''}`),
    buscar: (id) => apiRequest(`/ordens/${id}`),
    criar: (dados) => apiRequest('/ordens', { method: 'POST', body: JSON.stringify(dados) }),
    atualizarStatus: (id, dados) => apiRequest(`/ordens/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    concluir: (id) => apiRequest(`/ordens/${id}/concluir`, { method: 'PUT' }),
    cancelar: (id, motivo) => apiRequest(`/ordens/${id}/cancelar`, { method: 'PUT', body: JSON.stringify({ motivo }) })
  },

  checklist: {
    itensPadrao: () => apiRequest('/checklist/itens-padrao'),
    buscar: (osId) => apiRequest(`/checklist/${osId}`),
    salvar: (osId, itens) => apiRequest(`/checklist/${osId}`, { method: 'POST', body: JSON.stringify({ itens }) })
  },

  estoque: {
    listar: () => apiRequest('/estoque'),
    criar: (dados) => apiRequest('/estoque', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => apiRequest(`/estoque/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    remover: (id) => apiRequest(`/estoque/${id}`, { method: 'DELETE' })
  },

  financeiro: {
    resumo: () => apiRequest('/financeiro/resumo'),
    listar: () => apiRequest('/financeiro'),
    despesas: {
      listar: () => apiRequest('/financeiro/despesas'),
      criar: (dados) => apiRequest('/financeiro/despesas', { method: 'POST', body: JSON.stringify(dados) }),
      remover: (id) => apiRequest(`/financeiro/despesas/${id}`, { method: 'DELETE' })
    },
    contasReceber: {
      listar: () => apiRequest('/financeiro/contas-receber'),
      criar: (dados) => apiRequest('/financeiro/contas-receber', { method: 'POST', body: JSON.stringify(dados) }),
      marcarRecebido: (id) => apiRequest(`/financeiro/contas-receber/${id}/receber`, { method: 'PUT' })
    }
  },

  clientes: {
    listar: () => apiRequest('/clientes'),
    buscar: (id) => apiRequest(`/clientes/${id}`)
  },

  auth: {
    login: (email, senha) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
    me: () => apiRequest('/auth/me')
  },

  usuarios: {
    listar: () => apiRequest('/usuarios'),
    criar: (dados) => apiRequest('/usuarios', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => apiRequest(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    remover: (id) => apiRequest(`/usuarios/${id}`, { method: 'DELETE' })
  },

  configuracoes: {
    obter: () => apiRequest('/configuracoes'),
    atualizar: (dados) => apiRequest('/configuracoes', { method: 'PUT', body: JSON.stringify(dados) })
  },

  push: {
    chavePublica: () => apiRequest('/push/chave-publica'),
    inscrever: (subscription) => apiRequest('/push/inscrever', { method: 'POST', body: JSON.stringify(subscription) }),
    desinscrever: (endpoint) => apiRequest('/push/desinscrever', { method: 'POST', body: JSON.stringify({ endpoint }) })
  }
};

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataIso) {
  if (!dataIso) return '-';
  return new Date(dataIso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
