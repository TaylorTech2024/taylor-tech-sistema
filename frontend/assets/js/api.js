const API_BASE = '/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  let body = null;
  try { body = await res.json(); } catch (_) { /* resposta sem corpo */ }

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
    concluir: (id) => apiRequest(`/ordens/${id}/concluir`, { method: 'PUT' })
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
    listar: () => apiRequest('/financeiro')
  },

  clientes: {
    listar: () => apiRequest('/clientes'),
    buscar: (id) => apiRequest(`/clientes/${id}`)
  }
};

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataIso) {
  if (!dataIso) return '-';
  return new Date(dataIso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
