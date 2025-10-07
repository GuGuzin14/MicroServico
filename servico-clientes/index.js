const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8091;

// Memória simples
let clientes = [
  { id: 1, nome: 'Alice' },
  { id: 2, nome: 'Bruno' }
];
let nextId = 3;

app.get('/clientes', (req, res) => {
  res.json(clientes);
});

app.post('/clientes', (req, res) => {
  const { nome } = req.body;
  if(!nome) return res.status(400).json({erro: 'Nome é obrigatório'});
  const novo = { id: nextId++, nome };
  clientes.push(novo);
  res.status(201).json(novo);
});

app.listen(PORT, () => console.log(`[Clientes] Rodando em http://localhost:${PORT}`));
