# CageErpUI

Frontend administrativo em React, Vite, TypeScript e Tailwind, criado para evoluir junto com o `CageErpApi`.

O header possui a opcao **Vendas**, que consulta o historico em `GET /api/CageOutTransaction` e permite abrir o detalhe dos itens de cada compra. A tela trata carregamento, erro e lista vazia.

## Apresentacao comercial

A rota publica `/apresentacao` e a landing page da CageOuts para os QR Codes dos
convites. Nao exige login, nao consulta a API e nao exibe o menu administrativo.
Use no QR Code a URL completa do frontend publicado seguida de `/apresentacao`.
O rewrite de SPA em [vercel.json](vercel.json) permite acessar essa rota diretamente.

- Visual responsivo em azul-grafite, verde-petroleo e tons de salvia, inspirado no convite.
- Slogan "Proximo" em destaque na abertura; chamada principal "Agende uma demo".
  Os contatos de WhatsApp e e-mail abrem mensagens prontas para solicitar uma
  demonstracao e conhecer a empresa. O horario e combinado com a equipe;
  a pagina nao confirma nem reserva agendamentos automaticamente.
- Posicionamento comercial para o atacarejo: ecossistema completo de self-checkout,
  nao apenas a maquina, com foco em grandes compras e carrinhos cheios.
- Destaques: validacao de imagem e peso e monitoramento das compras em tempo real
  para a gestao. A pagina tambem inclui video, convite para visita e contatos.
- WhatsApp: Andre, `(41) 99717-5818`; Marcos, `(11) 93749-6956`.
- E-mail: `cageouts@gmail.com`.
- Visita: Av. Manuel Bandeira, 360, Vila Leopoldina, Sao Paulo - SP, CEP 05317-020.
- Contatos e links ficam em [ApresentacaoPage.tsx](src/pages/ApresentacaoPage.tsx);
  estilos isolados em [ApresentacaoPage.css](src/pages/ApresentacaoPage.css).

O video servido em [public/media/CageOuts-Promo.mp4](public/media/CageOuts-Promo.mp4)
e uma versao web do original `CageOuts-Promo.mp4` da raiz do workspace, preservado
sem alteracoes. A versao web usa H.264/AAC, 720p e `faststart` para streaming
progressivo. A capa [cageouts-promo-poster.jpg](public/media/cageouts-promo-poster.jpg)
foi extraida do proprio video. O player tem controles nativos, reproducao inline
no celular e `preload="none"`: nao baixa o video antecipadamente nem inicia
automaticamente. Ha um link para abrir o arquivo diretamente e aviso de falha
de carregamento. Os dois arquivos de midia precisam acompanhar o deploy.

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
