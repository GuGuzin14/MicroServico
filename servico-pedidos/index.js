// Carrega variáveis de ambiente de .env (se houver)
require('dotenv').config();

// Dependências principais e middlewares de segurança/compressão/log
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
app.use(cors()); // permite chamadas do frontend
app.use(express.json()); // entende JSON no corpo das requisições
app.use(helmet()); // adiciona cabeçalhos de segurança
app.use(compression()); // ativa gzip
app.use(morgan('dev')); // logs de requisição no console

// Configuração por variáveis de ambiente
const PORT = Number(process.env.PORT || 8093);
const URL_CLIENTES = process.env.URL_CLIENTES || 'http://localhost:8091';
const URL_PRODUTOS = process.env.URL_PRODUTOS || 'http://localhost:8092';

// Armazenamento em memória (apenas para demo)
// Estrutura: { id, cliente: {id,nome}, itens: [{produtoId,nome,preco,quantidade,subtotal}], total }
let pedidos = [];
let nextId = 1;

// Cliente HTTP com timeout para evitar travar em chamadas externas lentas
const http = axios.create({ timeout: 3000 });

// Helpers que consultam outros serviços
async function getCliente(clienteId) {
  const r = await http.get(`${URL_CLIENTES}/clientes`);
  return r.data.find((c) => c.id === Number(clienteId));
}
async function getProduto(produtoId) {
  const r = await http.get(`${URL_PRODUTOS}/produtos`);
  return r.data.find((p) => p.id === Number(produtoId));
}

// Healthcheck (para monitoramento)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pedidos', uptime: process.uptime() });
});

// Lista os pedidos atuais (em memória)
app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

// Cria um novo pedido a partir de cliente e itens enviados pelo frontend
app.post('/pedidos', async (req, res) => {
  try {
    const { clienteId, itens } = req.body || {};
    // Validação básica do corpo
    if (!clienteId || !Array.isArray(itens) || itens.length === 0) {
      return res
        .status(400)
        .json({ erro: 'clienteId e itens são obrigatórios' });
    }

    // Consulta o cliente no serviço de clientes
    const cliente = await getCliente(clienteId);
    if (!cliente)
      return res.status(404).json({ erro: 'Cliente não encontrado' });

    let total = 0;
    const itensDetalhados = [];

    // Para cada item, consulta o produto e calcula o subtotal
    for (const item of itens) {
      const prod = await getProduto(item.produtoId);
      if (!prod)
        return res
          .status(404)
          .json({ erro: `Produto ${item.produtoId} não encontrado` });
      const quantidade = Math.max(1, Number(item.quantidade || 1));
      const subtotal = prod.preco * quantidade;
      total += subtotal;
      itensDetalhados.push({
        produtoId: prod.id,
        nome: prod.nome,
        preco: prod.preco,
        quantidade,
        subtotal,
      });
    }

    // Monta o pedido final e salva em memória
    const pedido = {
      id: nextId++,
      cliente: { id: cliente.id, nome: cliente.nome },
      itens: itensDetalhados,
      total: Number(total.toFixed(2)),
    };
    pedidos.push(pedido);
    res.status(201).json(pedido);
  } catch (err) {
    console.error('[Pedidos] Erro criando pedido', err.code || '', err.message);
    res.status(500).json({ erro: 'Erro interno ao criar pedido' });
  }
});

// 404 para qualquer rota não atendida acima
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento de erro genérico (não expõe stack no response)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Pedidos] Erro:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Inicia o servidor HTTP
app.listen(PORT, () => console.log(`[Pedidos] Rodando em http://localhost:${PORT}`));
