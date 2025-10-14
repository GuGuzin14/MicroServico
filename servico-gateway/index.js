// Carrega as variáveis do .env (porta e URLs dos serviços)
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const app = express();
// Porta do gateway (prioriza GATEWAY_PORT)
const PORT = Number(process.env.GATEWAY_PORT || process.env.PORT || 8080);

// Middlewares padrão: CORS, JSON, segurança, compressão e logs
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// URLs dos serviços (fallback caso .env não exista)
const URL_CLIENTES = process.env.URL_CLIENTES || 'http://localhost:8091';
const URL_PRODUTOS = process.env.URL_PRODUTOS || 'http://localhost:8092';
const URL_PEDIDOS  = process.env.URL_PEDIDOS  || 'http://localhost:8093';

// Axios instances com timeout e baseURLs (evita repetir URLs e permite timeouts)
const httpClientes = axios.create({ baseURL: URL_CLIENTES, timeout: 3000 });
const httpProdutos = axios.create({ baseURL: URL_PRODUTOS, timeout: 3000 });
const httpPedidos  = axios.create({ baseURL: URL_PEDIDOS,  timeout: 3000 });

// Health do gateway (usado por monitoramento e testes de vida)
app.get('/api/health', (req, res) => res.json({ status: 'ok', gateway: true }));

// Proxy simples para listar
// Proxy: lista clientes do serviço de clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const r = await httpClientes.get(`/clientes`);
        res.json(r.data);
    } catch (e) {
        console.error('[Gateway] Erro clientes', e.code, e.message);
        res
            .status(502)
            .json({ erro: 'Falha ao obter clientes', detalhe: e.code || e.message });
    }
});

// Proxy: cria cliente
app.post('/api/clientes', async (req, res) => {
    try {
        const r = await httpClientes.post(`/clientes`, req.body);
        res.status(r.status).json(r.data);
    } catch (e) {
        res
            .status(e.response?.status || 500)
            .json(e.response?.data || { erro: 'Falha criar cliente' });
    }
});

// Proxy: lista produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const r = await httpProdutos.get(`/produtos`);
        res.json(r.data);
    } catch (e) {
        console.error('[Gateway] Erro produtos', e.code, e.message);
        res
            .status(502)
            .json({ erro: 'Falha ao obter produtos', detalhe: e.code || e.message });
    }
});

// Proxy: cria produto
app.post('/api/produtos', async (req, res) => {
    try {
        const r = await httpProdutos.post(`/produtos`, req.body);
        res.status(r.status).json(r.data);
    } catch (e) {
        res
            .status(e.response?.status || 500)
            .json(e.response?.data || { erro: 'Falha criar produto' });
    }
});

// Proxy: lista pedidos
app.get('/api/pedidos', async (req, res) => {
    try {
        const r = await httpPedidos.get(`/pedidos`);
        res.json(r.data);
    } catch (e) {
        console.error('[Gateway] Erro pedidos', e.code, e.message);
        res
            .status(502)
            .json({ erro: 'Falha ao obter pedidos', detalhe: e.code || e.message });
    }
});

// Proxy: cria pedido
app.post('/api/pedidos', async (req, res) => {
    try {
        const r = await httpPedidos.post(`/pedidos`, req.body);
        res.status(r.status).json(r.data);
    } catch (e) {
        res
            .status(e.response?.status || 500)
            .json(e.response?.data || { erro: 'Falha criar pedido' });
    }
});

// 404: rota não encontrada no gateway
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada no gateway' });
});

// Tratamento de erros do gateway
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('[Gateway] Erro:', err.message);
    res.status(500).json({ erro: 'Erro interno no gateway' });
});

app.listen(PORT, () => console.log(`[Gateway] Rodando em http://localhost:${PORT}`));