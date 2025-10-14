// App React principal do frontend
// Este componente carrega dados dos microserviços via Gateway
// e permite criar clientes, produtos e pedidos de forma simples.
import React, { useState, useEffect } from 'react';
import './App.css';

// URL base da API vem de variáveis de ambiente (Vite)
// .env: VITE_API_URL=http://localhost:8080/api
// O replace remove uma barra final se existir para evitar '//' nas rotas
const API = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8080/api';

function App(){
    const [clientes, setClientes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [novoCliente, setNovoCliente] = useState('');
    const [novoProduto, setNovoProduto] = useState({nome:'', preco:''});
    const [novoPedido, setNovoPedido] = useState({clienteId:'', itens:[]});
    const [itemTemp, setItemTemp] = useState({produtoId:'', quantidade:1});
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    // Pequeno helper para requisições: tenta converter JSON e lança erro com mensagem amigável
    async function fetchJson(url, opts){
        const r = await fetch(url, opts);
        let body; 
        try { body = await r.json(); } catch { body = null; }
        if(!r.ok){
            const detalhe = body?.detalhe || body?.erro || ('HTTP '+r.status);
            throw new Error(detalhe);
        }
        return body;
    }

    // Carrega clientes, produtos e pedidos em paralelo
    async function carregar(){
        try {
            setLoading(true);
            const [c,p,d] = await Promise.all([
                fetchJson(`${API}/clientes`),
                fetchJson(`${API}/produtos`),
                fetchJson(`${API}/pedidos`)
            ]);
            setClientes(c); setProdutos(p); setPedidos(d);
            setErro('');
    } catch(e){ setErro('Falha ao carregar dados: '+ e.message); }
        finally { setLoading(false); }
    }

    // Carrega ao montar o componente
    useEffect(()=>{ carregar(); },[]);

    // Cria um novo cliente
    async function adicionarCliente(){
        if(!novoCliente.trim()) return;
        try {
            await fetchJson(`${API}/clientes`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nome: novoCliente})});
            setNovoCliente('');
            carregar();
    } catch(e){ setErro('Erro ao adicionar cliente: ' + e.message); }
    }

    // Cria um novo produto
    async function adicionarProduto(){
        if(!novoProduto.nome.trim() || !novoProduto.preco) return;
        try {
            await fetchJson(`${API}/produtos`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nome: novoProduto.nome, preco: Number(novoProduto.preco)})});
            setNovoProduto({nome:'', preco:''});
            carregar();
    } catch(e){ setErro('Erro ao adicionar produto: ' + e.message); }
    }

    // Adiciona item temporário ao pedido (antes de enviar ao backend)
    function adicionarItemTemp(){
        if(!itemTemp.produtoId) return;
        setNovoPedido(prev => ({...prev, itens:[...prev.itens, {produtoId:Number(itemTemp.produtoId), quantidade:Number(itemTemp.quantidade||1)}]}));
        setItemTemp({produtoId:'', quantidade:1});
    }

    // Envia ao backend os dados do novo pedido para ser criado
    async function criarPedido(){
        if(!novoPedido.clienteId || novoPedido.itens.length===0) return;
        try {
            await fetchJson(`${API}/pedidos`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({clienteId:Number(novoPedido.clienteId), itens: novoPedido.itens})});
            setNovoPedido({clienteId:'', itens:[]});
            carregar();
    } catch(e){ setErro('Erro ao criar pedido: ' + e.message); }
    }

        return (
            <div className="container">
                <h1>Gerenciamento de Pedidos (Microserviços)</h1>
                {loading && <p>Carregando...</p>}
                {erro && (
                    <p className="error">
                        {erro} <button onClick={carregar}>Tentar novamente</button>
                    </p>
                )}

                {/* Seções organizadas em grid: Clientes, Produtos, Novo Pedido, Pedidos */}
                <section className="grid">
                    {/* Bloco de clientes: lista e formulário de inclusão */}
                    <div className="card">
                        <h2>Clientes</h2>
                        <ul className="list">
                            {clientes.map((c) => (
                                <li key={c.id}>
                                    <span>#{c.id}</span> {c.nome}
                                </li>
                            ))}
                        </ul>
                        <div className="row">
                            <input
                                placeholder="Nome cliente"
                                value={novoCliente}
                                onChange={(e) => setNovoCliente(e.target.value)}
                            />
                            <button onClick={adicionarCliente}>Adicionar</button>
                        </div>
                    </div>

                    {/* Bloco de produtos: lista e formulário de inclusão */}
                    <div className="card">
                        <h2>Produtos</h2>
                        <ul className="list">
                            {produtos.map((p) => (
                                <li key={p.id}>
                                    <span>#{p.id}</span> {p.nome} <em>(R$ {p.preco})</em>
                                </li>
                            ))}
                        </ul>
                        <div className="row">
                            <input
                                placeholder="Nome produto"
                                value={novoProduto.nome}
                                onChange={(e) => setNovoProduto((v) => ({ ...v, nome: e.target.value }))}
                            />
                            <input
                                placeholder="Preço"
                                type="number"
                                value={novoProduto.preco}
                                onChange={(e) => setNovoProduto((v) => ({ ...v, preco: e.target.value }))}
                            />
                            <button onClick={adicionarProduto}>Adicionar</button>
                        </div>
                    </div>

                    {/* Bloco de criação de novo pedido */}
                    <div className="card">
                        <h2>Novo Pedido</h2>
                        <label>Cliente: </label>
                        <select
                            value={novoPedido.clienteId}
                            onChange={(e) => setNovoPedido((p) => ({ ...p, clienteId: e.target.value }))}
                        >
                            <option value="">Selecione</option>
                            {clientes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>
                        <div className="divider" />
                        <h4>Adicionar Item</h4>
                        <div className="row">
                            <select
                                value={itemTemp.produtoId}
                                onChange={(e) => setItemTemp((i) => ({ ...i, produtoId: e.target.value }))}
                            >
                                <option value="">Produto</option>
                                {produtos.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                className="qty"
                                value={itemTemp.quantidade}
                                onChange={(e) => setItemTemp((i) => ({ ...i, quantidade: e.target.value }))}
                            />
                            <button onClick={adicionarItemTemp}>Adicionar item</button>
                        </div>
                        <ul className="list">
                            {novoPedido.itens.map((it, idx) => {
                                const prod = produtos.find((p) => p.id === it.produtoId);
                                return (
                                    <li key={idx}>
                                        {prod ? prod.nome : it.produtoId} x {it.quantidade}
                                    </li>
                                );
                            })}
                        </ul>
                        <button onClick={criarPedido}>Criar Pedido</button>
                    </div>

                    {/* Lista de pedidos existentes */}
                    <div className="card">
                        <h2>Pedidos</h2>
                        {pedidos.length === 0 && <p>Nenhum pedido ainda.</p>}
                        {pedidos.map((p) => (
                            <div key={p.id} className="order">
                                <strong>Pedido #{p.id}</strong> - Cliente: {p.cliente.nome}
                                <br />
                                Total: R$ {p.total}
                                <br />
                                <ul className="list">
                                    {p.itens.map((it, idx) => (
                                        <li key={idx}>
                                            {it.nome} x {it.quantidade} (R$ {it.subtotal})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
}

export default App;