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

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');

app.use(cors());
app.use(express.json());

app.get('/api/config', (req, res) => {
  res.json({ whatsapp: process.env.WHATSAPP_NUMERO || '' });
});

app.use('/api/catalogo', catalogoRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ordens', ordensRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/clientes', clientesRoutes);

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
