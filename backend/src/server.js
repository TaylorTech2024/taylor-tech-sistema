require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const catalogoRoutes = require('./routes/catalogo.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const ordensRoutes = require('./routes/ordens.routes');
const checklistRoutes = require('./routes/checklist.routes');
const estoqueRoutes = require('./routes/estoque.routes');
const financeiroRoutes = require('./routes/financeiro.routes');
const clientesRoutes = require('./routes/clientes.routes');
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const { autenticar, autorizar } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');

// Um erro assincrono nao tratado (ex: banco fora do ar) nao deve derrubar
// o processo inteiro - so essa requisicao falha.
process.on('unhandledRejection', (err) => console.error('unhandledRejection:', err));

app.use(cors());
app.use(express.json());

app.get('/api/config', (req, res) => {
  res.json({ whatsapp: process.env.WHATSAPP_NUMERO || '' });
});

app.use('/api/auth', authRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ordens', autenticar, autorizar('ordens'), ordensRoutes);
app.use('/api/checklist', autenticar, autorizar('ordens'), checklistRoutes);
app.use('/api/estoque', autenticar, autorizar('estoque'), estoqueRoutes);
app.use('/api/financeiro', autenticar, autorizar('financeiro'), financeiroRoutes);
app.use('/api/clientes', autenticar, autorizar('clientes'), clientesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Serve o front-end (PWA) direto pelo mesmo servidor/porta.
app.use(express.static(FRONTEND_DIR));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Taylor Tech rodando em http://localhost:${PORT}`);
  console.log(`  Vitrine do cliente: http://localhost:${PORT}/index.html`);
  console.log(`  Painel administrativo: http://localhost:${PORT}/admin.html`);
});
