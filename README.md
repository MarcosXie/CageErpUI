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
- Resultados brutos por jogo com +1/-1, compartilhados pela API via SignalR
  (`/hubs/halloween`) com polling de recuperacao a cada 3 segundos. Pontos e
  comandos sao idempotentes; um envio pendente fica salvo na aba para reenvio
  apos falha/reload. Somente rejeicoes definitivas podem ser descartadas.
- O geral usa colocacoes dos jogos explicitamente concluidos, nao soma os
  resultados brutos. Reabrir um resultado libera correcoes e retira sua
  contribuicao ate concluir novamente. Empates recebem a media das posicoes.
  Pesos (1o / 2o / 3o / 4o):

  | Jogo | Pontos no geral |
  | --- | --- |
  | Missoes | 80 / 55 / 30 / 15 |
  | Mimica | 70 / 35 por integrante da dupla; empate = 52,5 |
  | Drink Russo | 60 / 40 / 25 / 10 |
  | Quem sou eu | 60 / 40 / 25 / 10 |
  | Timer | 60 / 40 / 25 / 10 |
  | Sobrevivencia | 60 / 40 / 25 / 10 (menos sustos vence) |
  | Fantasia | 100 / 70 / 40 / 20 |

  Os cards iniciais destacam o premio do vencedor no geral; na mimica, o valor
  e por integrante da dupla vencedora. Fantasia tem o maior premio da noite.
  Alterar os pesos recalcula tambem jogos ja concluidos, sem mudar pontos brutos.
- Missoes: uma de cada grupo por sorteio, sem repetir em uma mesma sala/aba.
  `Terminei` esconde o par para passar o celular. Nao conclui nem pontua a missao:
  o grupo valida no fim da noite e ajusta o placar manualmente.
- Quem sou eu e mimica: 100 cartas em cada baralho, sem reposicao; quem sou eu
  prepara a carta oculta antes de revelar para a turma com o celular na testa.
  Acerto soma 1; passar nao pontua. Mimica: Andre + Maicon contra Leticia + Duda;
  pontuar qualquer integrante altera os dois membros da dupla atomicamente.
  Leticia conserva o identificador `Leh` na API.
- Timer: uma partida compartilhada de cinco rodadas por sala. Alvos inteiros
  progressivos (3-6, 7-11, 12-17, 18-24 e 25-30 segundos), iguais para todos.
  Os quatro abrem no proprio celular e confirmam prontidao (valida por 60s).
  Uma pessoa inicia uma contagem de 5s para todos. Cada um para o proprio timer
  oculto; tempos so aparecem quando a rodada fecha. O servidor soma 4/3/2/1 por
  erro absoluto em milissegundos automaticamente, uma unica vez por rodada;
  empates compartilham posicao e pulam a seguinte. Ausentes podem ser encerrados
  apos 90s e recebem zero. Resultado por rodada, historico e resultado final;
  o quadro permite ajustes manuais antes da conclusao do jogo.
  A largada usa UTC do servidor com calibracao de relogio e SignalR, nao a hora
  em que cada mensagem chega. Nao e tempo real exato: mantenham celulares
  desbloqueados, paginas em primeiro plano e rede estavel.
- Drink Russo: quatro copos, um diferente; todos votam secretamente em outra
  pessoa. A revelacao so e liberada apos quatro votos. Acerto vale +2; quem
  recebeu o copo alcoolico ganha +1 por oponente enganado e bonus de +2 se
  ninguem descobrir (ate 5). A revelacao soma automaticamente e permite nova
  rodada. Pode-se usar um sabor diferente sem alcool com as mesmas regras.
- Sobrevivencia: tentativa compartilhada de dez minutos por jogador; registrar
  sustos perceptiveis com +1 e corrigir no placar. Menor contagem vence;
  conclusao disponivel depois das quatro tentativas.
- Fantasia: salvar o link HTTPS do post no Instagram, conferir votos validos
  manualmente e registrar totais individuais. Sem login/integracao Instagram.

Jogador, missoes e baralhos usam `sessionStorage` (privados por aba e sala,
sobrevivem a reload; nao sao sincronizados). Ao encerrar a sessao do navegador
esses dados podem desaparecer. Placares, Timer, votos, tentativas e conclusoes
ficam no servidor. Salas antigas sao atualizadas automaticamente, preservando
resultados brutos; pontos antigos da mimica sao somados por dupla. O progresso
do antigo Timer local nao e importado para a partida compartilhada.
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
