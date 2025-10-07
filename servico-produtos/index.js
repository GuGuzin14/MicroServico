const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8092;

let produtos = [
  { id: 1, nome: 'Teclado', preco: 120.50 },
  { id: 2, nome: 'Mouse', preco: 70.00 }
];
let nextId = 3;

app.get('/produtos', (req, res) => {
  res.json(produtos);
});

app.post('/produtos', (req, res) => {
  const { nome, preco } = req.body;
  if(!nome || preco == null) return res.status(400).json({erro: 'Nome e preco são obrigatórios'});
  const novo = { id: nextId++, nome, preco: Number(preco) };
  produtos.push(novo);
  res.status(201).json(novo);
});

app.listen(PORT, () => console.log(`[Produtos] Rodando em http://localhost:${PORT}`));
