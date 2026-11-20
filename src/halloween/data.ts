export const PLAYERS = ['Andre', 'Duda', 'Leh', 'Maicon'] as const
export type Player = typeof PLAYERS[number]
export const PLAYER_NAMES: Record<Player, string> = { Andre: 'Andre', Duda: 'Duda', Leh: 'Letícia', Maicon: 'Maicon' }
export const TEAMS = [
  { name: 'Andre & Maicon', players: ['Andre', 'Maicon'] as const },
  { name: 'Letícia & Duda', players: ['Leh', 'Duda'] as const },
] as const

export const GAMES = [
  { id: 'missoes', title: 'Missões secretas', subtitle: 'Até o fim da noite', icon: 'scroll', tag: 'EM SEGREDO', description: 'Duas missões. Uma noite inteira para ninguém desconfiar.' },
  { id: 'mimica', title: 'Mímica de Halloween', subtitle: 'Dupla contra dupla', icon: 'drama', tag: 'EM DUPLAS', description: 'Andre & Maicon vs Letícia & Duda. Cada acerto é da dupla.' },
  { id: 'drink-russo', title: 'Drink Russo', subtitle: 'Sorte ou travessura?', icon: 'glass', tag: 'À MESA', description: 'Escolham os copos, combinem as regras e anotem os pontos.' },
  { id: 'quem-sou-eu', title: 'Quem sou eu?', subtitle: 'Uma criatura na testa', icon: 'ghost', tag: '100 CARTAS', description: 'Todo mundo sabe quem você é. Menos você.' },
  { id: 'timer', title: 'Timer', subtitle: 'Confie no seu sexto sentido', icon: 'timer', tag: '5 RODADAS', description: 'Sem olhar o relógio: quão perto do alvo você consegue parar?' },
  { id: 'sobrevivencia', title: 'Sobrevivência no jogo de terror', subtitle: 'Quem vai até o fim?', icon: 'skull', tag: 'CORAGEM', description: 'Preparem o jogo de terror. A sobrevivência vale pontos.' },
  { id: 'fantasia', title: 'Concurso de fantasia', subtitle: 'O público decide', icon: 'crown', tag: 'INSTAGRAM', description: 'A votação acontece no Instagram. Registrem aqui o resultado.' },
] as const
export type GameId = typeof GAMES[number]['id']
export type Scores = Record<GameId, Record<Player, number>>
export interface Room {
  id: string
  revision: number
  scores: Scores
  appliedOperations: string[]
  completedGames: GameId[]
  instagramPostUrl: string | null
  timer: TimerMatch
  drinkRounds: DrinkRound[]
  survival: { player: Player | null; startsAt: string | null; completedPlayers: Player[] }
}
export interface ScoreChange { player: Player; game: GameId; delta: number }
export interface TimerRound {
  id: string
  targetSeconds: number
  readyPlayers: Partial<Record<Player, string>>
  startsAt: string | null
  elapsedMilliseconds: Partial<Record<Player, number | null>>
  stoppedPlayers: Player[]
  points: Partial<Record<Player, number>>
  awarded: boolean
}
export interface TimerMatch { id: string; roundIndex: number; rounds: TimerRound[] }
export interface DrinkRound {
  id: string
  votes: Partial<Record<Player, Player>>
  votedPlayers: Player[]
  holder: Player | null
  points: Partial<Record<Player, number>>
}
export interface GameAction {
  action: 'game-status' | 'instagram' | 'fantasy-votes' | 'timer-ready' | 'timer-start' | 'timer-stop'
    | 'timer-next' | 'timer-close' | 'drink-start' | 'drink-vote' | 'drink-reveal'
    | 'survival-start' | 'survival-finish' | 'survival-cancel'
  game?: GameId
  player?: Player
  target?: Player
  roundId?: string
  completed?: boolean
  elapsedMs?: number
  url?: string
  votes?: number
}
export type Act = (action: GameAction) => void
export interface Mission { title: string; text: string }

export const RECORDED_MISSIONS: Mission[] = [
  { title: 'Troca de acessório', text: 'Pegue emprestado ou peça um item pequeno/acessório de 3 pessoas diferentes e use os três ao mesmo tempo em algum momento da festa. Tire uma foto registrando.' },
  { title: 'O cúmplice involuntário', text: 'Convença alguém a fazer uma pose específica ou segurar algo para você “enquanto ajeita a fantasia”, ou com alguma outra desculpa. Tire uma foto ou registre o momento.' },
  { title: 'Dança das cadeiras invisível', text: 'Termine a festa sentado em um lugar diferente de onde começou, tendo trocado de assento pelo menos 4 vezes sem ninguém comentar. Tire uma selfie em cada lugar e fique nele por ao menos 10 minutos.' },
  { title: 'Objeto viajante', text: 'Mova um objeto pequeno da decoração ou da mesa (porta-copos, controle, enfeite) de lugar 3 vezes ao longo da noite, deixando-o ao menos 10 minutos em cada lugar. Fotografe ao menos uma posição.' },
  { title: 'O detalhe da fantasia', text: 'Tire uma foto bem fechada de um detalhe específico da fantasia de cada convidado (adereço, sapato, maquiagem ou estampa), sem parecer que está fazendo um álbum de fotos.' },
  { title: 'Registro enchendo a cara', text: 'Registre um vídeo de cada convidado bebendo. Vale qualquer bebida, inclusive água e opções sem álcool; peça autorização para filmar.' },
  { title: 'Fotógrafo', text: 'Tire uma foto em dupla com todos os convidados.' },
]
export const UNRECORDED_MISSIONS: Mission[] = [
  { title: 'Elogio no modo fantasma', text: 'Elogie a fantasia de cada convidado pelo menos uma vez, sempre de um jeito vago ou de duplo sentido, sem deixar claro que é um elogio direto.' },
  { title: 'Eco sutil', text: 'Repita a última palavra de 5 frases ditas por outras pessoas durante a festa, em tom natural, como se estivesse concordando ou processando.' },
  { title: 'Dança do nada', text: 'Comece a dançar sozinho por 10 segundos no meio de uma conversa normal e depois volte a falar como se nada tivesse acontecido.' },
  { title: 'A troca discreta', text: 'Troque seu copo ou prato de lugar com o de outra pessoa sem que ela perceba na hora. Para manter a brincadeira segura, use apenas copos ou pratos vazios e limpos.' },
  { title: 'O sabotador sutil', text: 'Perca propositalmente a primeira rodada de um jogo de um jeito bem proposital, mas sem que ninguém descubra a missão.' },
  { title: 'O espelho', text: 'Imite discretamente a postura corporal (braços cruzados, perna cruzada, mão no queixo) de uma mesma pessoa por 10 minutos seguidos.' },
  { title: 'O aplauso solitário', text: 'Bata palmas sozinho 3 vezes na noite por motivos banais: alguém acertou o lixo, abriu um pacote ou venceu um mini-desafio.' },
]

export const CHARACTERS = [
  'Drácula', 'Vampiro', 'Bruxa', 'Fantasma', 'Zumbi',
  'Lobisomem', 'Múmia', 'Monstro de Frankenstein', 'Esqueleto', 'Morte com foice',
  'Diabo', 'Demônio', 'Abóbora de Halloween', 'Gato preto', 'Morcego',
  'Aranha', 'Corvo', 'Espantalho', 'Caldeirão de bruxa', 'Vassoura voadora',
  'Poção mágica', 'Chapéu de bruxa', 'Varinha mágica', 'Bola de cristal', 'Casa mal-assombrada',
  'Caixão', 'Cemitério', 'Lápide', 'Teia de aranha', 'Lua cheia',
  'Caveira', 'Vela', 'Maçã envenenada', 'Espelho mágico', 'Boneca amaldiçoada',
  'Chucky', 'Noiva do Chucky', 'Annabelle', 'Freddy Krueger', 'Jason Voorhees',
  'Michael Myers', 'Ghostface (Pânico)', 'Pennywise (It)', 'Jigsaw (Jogos Mortais)', 'Samara (O Chamado)',
  'A Freira', 'Beetlejuice', 'Edward Mãos de Tesoura', 'Jack Skellington', 'Sally (O Estranho Mundo de Jack)',
  'Oogie Boogie', 'Noiva Cadáver', 'Coraline', 'A Outra Mãe (Coraline)', 'Wandinha Addams',
  'Mortícia Addams', 'Gomez Addams', 'Tio Chico', 'Mãozinha', 'Primo Itt',
  'Hulk', 'Gasparzinho', 'Scooby-Doo', 'Salsicha', 'Velma',
  'Daphne', 'Fred (Scooby-Doo)', 'Slimer (Geleia dos Caça-Fantasmas)', 'Homem de Marshmallow (Caça-Fantasmas)', 'Caça-Fantasmas',
  'Harry Potter', 'Voldemort', 'Dobby', 'Dementador', 'Hermione Granger',
  'Malévola', 'Úrsula', 'Rainha Má da Branca de Neve', 'Jafar', 'Capitão Gancho',
  'Cruella', 'Hades (Hércules)', 'Duende Verde', 'Winifred Sanderson (Abracadabra)', 'Bruxa do Oeste (Mágico de Oz)',
  'Bruxa de João e Maria', 'Lobo Mau', 'Cuca', 'Saci', 'Mula sem cabeça',
  'Curupira', 'Boitatá', 'Bicho-papão', 'Boi da cara preta', 'ET',
  'Alien (Xenomorfo)', 'Predador', 'Godzilla', 'King Kong', 'Demogorgon (Stranger Things)',
] as const

export const MIME_PROMPTS = [
  'Vampiro escovando os dentes', 'Bruxa aprendendo a voar', 'Zumbi correndo uma maratona', 'Fantasma tentando assustar', 'Lobisomem uivando para a lua',
  'Múmia se desenrolando', 'Esqueleto dançando samba', 'Abóbora contando uma piada', 'Gato preto tomando um susto', 'Morcego perdido no quarto',
  'Vampiro montado na mula sem cabeça', 'Bruxa fazendo sopa no caldeirão', 'Zumbi no cabeleireiro', 'Fantasma preso no elevador', 'Lobisomem fazendo depilação',
  'Múmia indo ao banheiro', 'Esqueleto jogando futebol', 'Monstro de Frankenstein aprendendo balé', 'Aranha tecendo uma teia', 'Espantalho com medo de pássaro',
  'Vampiro se olhando no espelho', 'Bruxa estacionando a vassoura', 'Zumbi procurando o cérebro', 'Fantasma tentando vestir uma calça', 'Lobisomem no pet shop',
  'Múmia fazendo ioga', 'Esqueleto com dor nas costas', 'Abóbora rolando escada abaixo', 'Gato preto caçando uma luz', 'Morcego dormindo de cabeça para baixo',
  'Chucky pedindo colo', 'Annabelle numa entrevista de emprego', 'Freddy Krueger cortando uma pizza', 'Jason tentando abrir um pote', 'Ghostface atendendo o telefone',
  'Pennywise enchendo um balão', 'Samara saindo de uma TV pequena', 'Wandinha dançando', 'Mãozinha tocando piano', 'Tio Chico acendendo uma lâmpada',
  'Drácula comendo pão de alho por engano', 'Bruxa com GPS quebrado', 'Zumbi na academia', 'Fantasma tirando uma selfie', 'Lobisomem passeando com cachorro',
  'Múmia enrolando um presente', 'Esqueleto tocando bateria', 'Frankenstein tentando trocar uma lâmpada', 'Abóbora fazendo maquiagem', 'Espantalho fugindo do vento',
  'Vampiro no dentista', 'Bruxa varrendo a casa sem voar', 'Zumbi andando de patins', 'Fantasma atravessando uma parede', 'Lobisomem espirrando',
  'Múmia pulando corda', 'Esqueleto tentando ficar musculoso', 'Gato preto derrubando um vaso', 'Morcego aprendendo a nadar', 'Aranha usando oito sapatos',
  'Caça-Fantasmas aspirando a casa', 'Harry Potter errando um feitiço', 'Voldemort procurando o nariz', 'Dobby recebendo uma meia', 'Malévola prendendo os chifres na porta',
  'Úrsula passando creme nos tentáculos', 'Capitão Gancho tentando tricotar', 'Rainha Má consultando o espelho', 'Coraline procurando a chave', 'Jack Skellington decorando uma árvore',
  'Noiva Cadáver jogando o buquê', 'Scooby-Doo fugindo de um fantasma', 'Salsicha montando um sanduíche gigante', 'Velma procurando os óculos', 'Gasparzinho tentando ser assustador',
  'Saci jogando amarelinha', 'Cuca ninando um bebê', 'Mula sem cabeça procurando um chapéu', 'Curupira comprando sapatos', 'Boitatá apagando um incêndio',
  'Bruxa entregando comida de vassoura', 'Vampiro passando protetor solar', 'Zumbi numa chamada de vídeo', 'Fantasma soprando velinhas', 'Lobisomem fazendo as unhas',
  'Múmia presa no papel higiênico', 'Esqueleto perdendo um osso', 'Monstro fugindo de uma barata', 'Diabo com frio', 'Morte afiando a foice',
  'Abóbora sendo esculpida', 'Caldeirão transbordando', 'Porta de casa mal-assombrada rangendo', 'Pessoa presa numa teia de aranha', 'Pessoa com medo do próprio reflexo',
  'Alien pedindo informação na rua', 'Godzilla pisando em Lego', 'King Kong dançando no prédio', 'Demogorgon tentando comer espaguete', 'Lagartixa de bruxa fugindo da abóbora',
] as const
