# CageCloud UI (CageErpUI)

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

## Halloween das Lagartixas

A area publica `/halloween` e independente do login e do layout administrativo,
carregada sob demanda, com estilos isolados e a imagem fornecida em
`public/halloween/lagartixa.png`. Escolha Andre, Duda, Leh ou Maicon. Uma pessoa
cria a sala; os demais entram pelo link `/halloween?s=<id>`. O identificador
aleatorio funciona como chave de acesso: qualquer pessoa com o link pode editar
o placar. Nao compartilhar publicamente.

- Sete paginas: `missoes`, `mimica`, `drink-russo`, `quem-sou-eu`, `timer`,
  `sobrevivencia` e `fantasia`, sob `/halloween/`, preservando `?s=<id>`.
- Placar individual por jogo com +1/-1 e geral calculado pela soma, compartilhado
  pela API e atualizado a cada 3 segundos. Reenvios de pontos sao idempotentes;
  um envio pendente fica salvo na aba e pode ser reenviado apos falha/reload.
- Missoes: uma de cada grupo por sorteio, sem repetir em uma mesma sala/aba.
  `Terminei` esconde o par para passar o celular. Nao conclui nem pontua a missao:
  o grupo valida no fim da noite e ajusta o placar manualmente.
- Quem sou eu e mimica: 100 cartas em cada baralho, sem reposicao; quem sou eu
  prepara a carta oculta antes de revelar para a turma com o celular na testa.
  Acerto soma 1 ao jogador selecionado; passar nao pontua.
- Timer: jogar os quatro turnos no mesmo aparelho. Cinco alvos inteiros
  progressivos (3-6, 7-11, 12-17, 18-24 e 25-30 segundos), iguais para todos em
  cada rodada. Relogio oculto, erro absoluto em milissegundos; ranking 4/3/2/1.
  Empates dividem a posicao e pulam a proxima. O resultado final e somado ao
  placar com `Salvar resultado no placar`, uma unica vez por partida.
- Drink Russo, Sobrevivencia e Concurso de fantasia: instrucoes presenciais e
  pontos manuais, sem inventar regras automaticas para a turma.

Jogador, missoes, baralhos e progresso do Timer usam `sessionStorage` (privados
por aba e sala, sobrevivem a reload; nao sao sincronizados). Ao encerrar a sessao
do navegador esses dados podem desaparecer; os placares ficam no servidor.
Nenhuma foto/video dos jogadores e enviada. O link da sala permite recuperar
os placares em outro dispositivo; guarde-o antes de fechar a aba.

Depende da publicacao dos endpoints Halloween da API configurada por
`VITE_API_BASE_URL`. Nao existe fallback para um placar local quando a API falha.
Consulte `CageErpApi/CAGEOUTS_ENDPOINTS.md` para armazenamento e deploy.

Validacao focada (Node 24+, sem dependencias novas):

```powershell
node --test .\src\halloween\gameLogic.test.mjs
npx eslint src\halloween src\pages\HalloweenPage.tsx src\App.tsx
```

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
