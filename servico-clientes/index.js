// Carrega variáveis de ambiente do arquivo .env (se existir)
require('dotenv').config();
// Importa o framework web Express
const express = require('express');
// Libera requisições de outros domínios (frontend)
const cors = require('cors');
// Cabeçalhos de segurança
const helmet = require('helmet');
// Comprime as respostas para economizar banda
const compression = require('compression');
// Loga requisições no console (método, rota, tempo)
const morgan = require('morgan');

const app = express();

// Middlewares comuns (rodam para todas as requisições)
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

const PORT = Number(process.env.PORT || 8091);

// Banco de dados em memória (apenas para demonstração)
let clientes = [
  { id: 1, nome: 'Alice' },
  { id: 2, nome: 'Bruno' },
];
let nextId = 3;

// Healthcheck (útil para monitoramento/ver se o serviço está vivo)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'clientes', uptime: process.uptime() });
});

app.get('/clientes', (req, res) => {
  res.json(clientes);
});

app.post('/clientes', (req, res) => {
  const { nome } = req.body || {};
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
  const novo = { id: nextId++, nome: String(nome) };
  clientes.push(novo);
  res.status(201).json(novo);
});

// 404 handler (quando nenhuma rota acima foi atendida)
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Error handler (captura exceções não tratadas nas rotas)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log mínimo, sem vazar stack para o cliente
  console.error('[Clientes] Erro:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Sobe o servidor HTTP na porta definida
app.listen(PORT, () => console.log(`[Clientes] Rodando em http://localhost:${PORT}`));
