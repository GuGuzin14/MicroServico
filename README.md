# Microserviços de Pedidos

Conjunto de microserviços simples (Clientes, Produtos, Pedidos) com um Gateway e um frontend em React (Vite).

## Serviços
- servico-clientes: CRUD básico em memória para clientes
- servico-produtos: CRUD básico em memória para produtos
- servico-pedidos: cria pedidos consultando clientes e produtos
- servico-gateway: expõe uma API unificada em `/api`
- frontend-react: interface para operar os serviços

## Como executar

1. Instale as dependências em cada pasta (primeira vez):
   - Na raiz: `npm install`
   - Em cada serviço e no frontend: `npm install`

2. Inicie tudo de uma vez pela raiz:
   - `npm run dev`

Isso inicia:
- Clientes: http://localhost:8091
- Produtos: http://localhost:8092
- Pedidos: http://localhost:8093
- Gateway: http://localhost:8080
- Frontend: http://localhost:5173

## Variáveis de ambiente

- Gateway (`servico-gateway/.env`):
  - `GATEWAY_PORT=8080`
  - `URL_CLIENTES=http://localhost:8091`
  - `URL_PRODUTOS=http://localhost:8092`
  - `URL_PEDIDOS=http://localhost:8093`

- Frontend (`frontend-react/.env`):
  - `VITE_API_URL=http://localhost:8080/api`

- Cada serviço aceita `PORT` (opcional).

## Padrões e estilo

- Middleware comum aplicado: `helmet`, `compression`, `morgan`, `cors`, `express.json()`
- Healthcheck em cada serviço: `GET /health`
- Handlers de 404 e erro padrão
- Prettier configurado na raiz (`.prettierrc`) e EditorConfig (`.editorconfig`)

## Endpoints principais

- GET/POST `/api/clientes`
- GET/POST `/api/produtos`
- GET/POST `/api/pedidos`

Sinta-se à vontade para estender com persistência real (banco de dados) e autenticação.