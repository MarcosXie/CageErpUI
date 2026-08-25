# CageErpUI

Frontend administrativo em React, Vite, TypeScript e Tailwind, criado para evoluir junto com o `CageErpApi`.

O header possui a opcao **Vendas**, que consulta o historico em `GET /api/CageOutTransaction` e permite abrir o detalhe dos itens de cada compra. A tela trata carregamento, erro e lista vazia.

## Comandos

```powershell
npm install
npm run dev
npm run build
npm run lint
```

## Ambiente

Configure a URL base da API, incluindo protocolo e o prefixo `/api`:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

Em producao, o arquivo `.env` atual usa `https://api.cageouts.com.br/api`.
