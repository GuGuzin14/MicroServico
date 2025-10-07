import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8080/api';

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

    useEffect(()=>{ carregar(); },[]);

    async function adicionarCliente(){
        if(!novoCliente.trim()) return;
        try {
            await fetchJson(`${API}/clientes`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nome: novoCliente})});
            setNovoCliente('');
            carregar();
    } catch(e){ setErro('Erro ao adicionar cliente: ' + e.message); }
    }

    async function adicionarProduto(){
        if(!novoProduto.nome.trim() || !novoProduto.preco) return;
        try {
            await fetchJson(`${API}/produtos`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nome: novoProduto.nome, preco: Number(novoProduto.preco)})});
            setNovoProduto({nome:'', preco:''});
            carregar();
    } catch(e){ setErro('Erro ao adicionar produto: ' + e.message); }
    }

    function adicionarItemTemp(){
        if(!itemTemp.produtoId) return;
        setNovoPedido(prev => ({...prev, itens:[...prev.itens, {produtoId:Number(itemTemp.produtoId), quantidade:Number(itemTemp.quantidade||1)}]}));
        setItemTemp({produtoId:'', quantidade:1});
    }

    async function criarPedido(){
        if(!novoPedido.clienteId || novoPedido.itens.length===0) return;
        try {
            await fetchJson(`${API}/pedidos`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({clienteId:Number(novoPedido.clienteId), itens: novoPedido.itens})});
            setNovoPedido({clienteId:'', itens:[]});
            carregar();
    } catch(e){ setErro('Erro ao criar pedido: ' + e.message); }
    }

    return (
        <div style={{fontFamily:'system-ui, Arial', padding:'1.5rem', maxWidth: '1100px', margin:'0 auto'}}>
            <h1>Gerenciamento de Pedidos (Microserviços)</h1>
            {loading && <p>Carregando...</p>}
            {erro && <p style={{color:'red'}}>{erro} <button onClick={carregar}>Tentar novamente</button></p>}

            <section style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:'1.5rem'}}>
                <div style={{border:'1px solid #ccc', borderRadius:8, padding:'1rem'}}>
                    <h2>Clientes</h2>
                    <ul>{clientes.map(c=> <li key={c.id}>{c.id} - {c.nome}</li>)}</ul>
                    <input placeholder='Nome cliente' value={novoCliente} onChange={e=>setNovoCliente(e.target.value)} />
                    <button onClick={adicionarCliente}>Adicionar</button>
                </div>

                <div style={{border:'1px solid #ccc', borderRadius:8, padding:'1rem'}}>
                    <h2>Produtos</h2>
                        <ul>{produtos.map(p=> <li key={p.id}>{p.id} - {p.nome} (R$ {p.preco})</li>)}</ul>
                        <input placeholder='Nome produto' value={novoProduto.nome} onChange={e=>setNovoProduto(v=>({...v,nome:e.target.value}))} />
                        <input placeholder='Preço' type='number' value={novoProduto.preco} onChange={e=>setNovoProduto(v=>({...v,preco:e.target.value}))} />
                        <button onClick={adicionarProduto}>Adicionar</button>
                </div>

                <div style={{border:'1px solid #ccc', borderRadius:8, padding:'1rem'}}>
                    <h2>Novo Pedido</h2>
                    <label>Cliente: </label>
                    <select value={novoPedido.clienteId} onChange={e=>setNovoPedido(p=>({...p, clienteId:e.target.value}))}>
                        <option value=''>Selecione</option>
                        {clientes.map(c=> <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <div style={{marginTop:'0.5rem'}}>
                        <h4>Adicionar Item</h4>
                        <select value={itemTemp.produtoId} onChange={e=>setItemTemp(i=>({...i, produtoId:e.target.value}))}>
                            <option value=''>Produto</option>
                            {produtos.map(p=> <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                        <input type='number' min='1' style={{width:70, marginLeft:4}} value={itemTemp.quantidade} onChange={e=>setItemTemp(i=>({...i, quantidade:e.target.value}))} />
                        <button onClick={adicionarItemTemp}>+</button>
                        <ul>
                            {novoPedido.itens.map((it,idx)=>{
                                const prod = produtos.find(p=>p.id===it.produtoId);
                                return <li key={idx}>{prod?prod.nome:it.produtoId} x {it.quantidade}</li>
                            })}
                        </ul>
                    </div>
                    <button onClick={criarPedido}>Criar Pedido</button>
                </div>

                <div style={{border:'1px solid #ccc', borderRadius:8, padding:'1rem'}}>
                    <h2>Pedidos</h2>
                    {pedidos.length===0 && <p>Nenhum pedido ainda.</p>}
                    {pedidos.map(p=> (
                        <div key={p.id} style={{borderBottom:'1px solid #eee', marginBottom:'0.5rem'}}>
                            <strong>Pedido #{p.id}</strong> - Cliente: {p.cliente.nome}<br/>
                            Total: R$ {p.total}<br/>
                            <ul>
                                {p.itens.map((it,idx)=> <li key={idx}>{it.nome} x {it.quantidade} (R$ {it.subtotal})</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default App;