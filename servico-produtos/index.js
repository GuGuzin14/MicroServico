// Carrega variáveis de ambiente
require('dotenv').config();
// Framework web
const express = require('express');
// Habilita CORS (acessar de outros domínios)
const cors = require('cors');
// Segurança, compressão e logs
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Porta do serviço (padrão 8092)
const PORT = Number(process.env.PORT || 8092);

// Dados em memória
let produtos = [
  { id: 1, nome: 'Teclado', preco: 120.5 },
  { id: 2, nome: 'Mouse', preco: 70.0 },
];
let nextId = 3;

// Healthcheck (status do serviço)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'produtos', uptime: process.uptime() });
});

app.get('/produtos', (req, res) => {
  res.json(produtos);
});

// Criação de um novo produto
app.post('/produtos', (req, res) => {
  const { nome, preco } = req.body || {};
  if (!nome || preco == null)
    return res.status(400).json({ erro: 'Nome e preco são obrigatórios' });
  const novo = { id: nextId++, nome: String(nome), preco: Number(preco) };
  produtos.push(novo);
  res.status(201).json(novo);
});

// 404 para rotas inexistentes
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// eslint-disable-next-line no-unused-vars
// Tratamento de erro genérico
app.use((err, req, res, next) => {
  console.error('[Produtos] Erro:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Inicializa o servidor
app.listen(PORT, () => console.log(`[Produtos] Rodando em http://localhost:${PORT}`));
