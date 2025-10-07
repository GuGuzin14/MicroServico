const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8093;

// Pedidos em memória
// Estrutura: { id, clienteId, itens: [{produtoId, quantidade}], total }
let pedidos = [];
let nextId = 1;

// Helpers para buscar dados em outros serviços
async function getCliente(clienteId){
  const r = await axios.get(`http://localhost:8091/clientes`);
  return r.data.find(c => c.id === Number(clienteId));
}
async function getProduto(produtoId){
  const r = await axios.get(`http://localhost:8092/produtos`);
  return r.data.find(p => p.id === Number(produtoId));
}

app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

app.post('/pedidos', async (req, res) => {
  try {
    const { clienteId, itens } = req.body;
    if(!clienteId || !Array.isArray(itens) || itens.length === 0){
      return res.status(400).json({erro: 'clienteId e itens são obrigatórios'});
    }
    const cliente = await getCliente(clienteId);
    if(!cliente) return res.status(404).json({erro: 'Cliente não encontrado'});

    let total = 0;
    const itensDetalhados = [];
    for(const item of itens){
      const prod = await getProduto(item.produtoId);
      if(!prod) return res.status(404).json({erro: `Produto ${item.produtoId} não encontrado`});
      const quantidade = Number(item.quantidade || 1);
      const subtotal = prod.preco * quantidade;
      total += subtotal;
      itensDetalhados.push({ produtoId: prod.id, nome: prod.nome, preco: prod.preco, quantidade, subtotal });
    }

    const pedido = { id: nextId++, cliente: { id: cliente.id, nome: cliente.nome }, itens: itensDetalhados, total: Number(total.toFixed(2)) };
    pedidos.push(pedido);
    res.status(201).json(pedido);
  } catch(err){
    console.error('[Pedidos] Erro criando pedido', err.message);
    res.status(500).json({erro: 'Erro interno ao criar pedido'});
  }
});

app.listen(PORT, () => console.log(`[Pedidos] Rodando em http://localhost:${PORT}`));
