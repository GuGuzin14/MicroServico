require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.GATEWAY_PORT || 8080;

app.use(cors());
app.use(express.json());

// URLs dos serviços (fallback caso .env não exista)
const URL_CLIENTES = process.env.URL_CLIENTES || 'http://localhost:8091';
const URL_PRODUTOS = process.env.URL_PRODUTOS || 'http://localhost:8092';
const URL_PEDIDOS  = process.env.URL_PEDIDOS  || 'http://localhost:8093';

// Health
app.get('/api/health', (req, res) => res.json({status: 'ok'}));

// Proxy simples para listar
app.get('/api/clientes', async (req, res) => {
    try {
        const r = await axios.get(`${URL_CLIENTES}/clientes`);
        res.json(r.data);
    } catch (e){
        console.error('[Gateway] Erro clientes', e.code, e.message);
        res.status(502).json({erro: 'Falha ao obter clientes', detalhe: e.code || e.message});
    }
});

app.post('/api/clientes', async (req, res) => {
    try {
        const r = await axios.post(`${URL_CLIENTES}/clientes`, req.body);
        res.status(r.status).json(r.data);
    } catch(e){
        res.status(e.response?.status || 500).json(e.response?.data || {erro:'Falha criar cliente'});
    }
});

app.get('/api/produtos', async (req, res) => {
    try {
        const r = await axios.get(`${URL_PRODUTOS}/produtos`);
        res.json(r.data);
    } catch (e){
        console.error('[Gateway] Erro produtos', e.code, e.message);
        res.status(502).json({erro: 'Falha ao obter produtos', detalhe: e.code || e.message});
    }
});

app.post('/api/produtos', async (req, res) => {
    try {
        const r = await axios.post(`${URL_PRODUTOS}/produtos`, req.body);
        res.status(r.status).json(r.data);
    } catch(e){
        res.status(e.response?.status || 500).json(e.response?.data || {erro:'Falha criar produto'});
    }
});

app.get('/api/pedidos', async (req, res) => {
    try {
        const r = await axios.get(`${URL_PEDIDOS}/pedidos`);
        res.json(r.data);
    } catch (e){
        console.error('[Gateway] Erro pedidos', e.code, e.message);
        res.status(502).json({erro: 'Falha ao obter pedidos', detalhe: e.code || e.message});
    }
});

app.post('/api/pedidos', async (req, res) => {
    try {
        const r = await axios.post(`${URL_PEDIDOS}/pedidos`, req.body);
        res.status(r.status).json(r.data);
    } catch(e){
        res.status(e.response?.status || 500).json(e.response?.data || {erro:'Falha criar pedido'});
    }
});

app.listen(PORT, () => console.log(`[Gateway] Rodando em http://localhost:${PORT}`));