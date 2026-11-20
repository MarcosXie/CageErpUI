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
  'Lobisomem', 'Múmia', 'Frankenstein', 'Esqueleto', 'Morte',
  'Demônio', 'Abóbora de Halloween', 'Gato preto', 'Morcego',
  'Aranha', 'Corvo', 'Espantalho', 'Caldeirão de bruxa', 'Vassoura voadora',
  'Poção mágica', 'Chapéu de bruxa', 'Varinha mágica', 'Bola de cristal', 'Casa mal-assombrada',
  'Caixão', 'Cemitério', 'Lápide', 'Teia de aranha', 'Lua cheia',
  'Caveira', 'Vela', 'Maçã envenenada', 'Espelho mágico', 'Boneca amaldiçoada',
  'Chucky', 'Freddy Krueger', 'Jason',
  'Pennywise (It)', 'Samara (O Chamado)',
  'Gasparzinho', 'Scooby-Doo', 'Salsicha', 'Velma',
  'Daphne', 'Fred (Scooby-Doo)',
  'Malévola', 'Rainha Má da Branca de Neve',
  'Duende Verde (Homem-Aranha)', 'Lobo Mau', 'Cuca', 'Saci', 'Mula sem cabeça',
  'Curupira', 'Boitatá', 'Bicho-papão', 'Boi da cara preta', 'ET',
  'Alien', 'Godzilla', 'King Kong',
] as const

export const MIME_PROMPTS = [
  'Vampiro', 'Bruxa', 'Zumbi', 'Fantasma', 'Lobisomem',
  'Múmia', 'Esqueleto', 'Abóbora', 'Gato preto', 'Morcego',
  'Aranha', 'Coruja', 'Corvo', 'Caveira', 'Espantalho',
  'Monstro', 'Demônio', 'Diabo', 'Morte', 'Drácula',
  'Frankenstein', 'Chucky', 'Annabelle', 'Wandinha', 'Mãozinha',
  'Pennywise', 'Jason', 'Samara', 'Saci', 'Cuca',
  'Curupira', 'Alien', 'Godzilla', 'King Kong', 'Gasparzinho',
  'Harry Potter', 'Voldemort', 'Dobby', 'Malévola', 'Scooby-Doo',
  'Caixão', 'Cemitério', 'Lápide', 'Caldeirão', 'Vassoura',
  'Varinha', 'Vela', 'Lanterna', 'Máscara', 'Capa',
  'Chapéu mágico', 'Espelho mágico', 'Poção mágica', 'Maçã envenenada', 'Casa assombrada',
  'Castelo assombrado', 'Porta rangendo', 'Teia', 'Lua cheia', 'Sangue',
  'Presas', 'Garras', 'Chifres', 'Correntes', 'Tumba',
  'Uivar', 'Assustar', 'Fugir', 'Gritar', 'Tremer',
  'Enfeitiçar', 'Voar', 'Rastejar', 'Morder', 'Ressuscitar',
  'Vampiro dançando', 'Bruxa voando', 'Zumbi andando', 'Fantasma flutuando', 'Lobisomem uivando',
  'Múmia enrolada', 'Esqueleto dançando', 'Abóbora sorrindo', 'Aranha subindo', 'Morcego voando',
  'Bruxa cozinhando', 'Vampiro dormindo', 'Zumbi comendo', 'Fantasma assustando', 'Monstro rugindo',
  'Espantalho dançando', 'Gato arrepiado', 'Boneca possuída', 'Palhaço assustador', 'Cachorro fantasma',
  'Cobra rastejando', 'Lobo uivando', 'Sapo pulando', 'Abóbora rolando', 'Lagartixa bruxa',
  'Godzilla nadando', 'Chucky correndo', 'Annabelle andando', 'Wandinha dançando', 'Mãozinha acenando',
  'Pennywise dançando', 'Jason correndo', 'Samara rastejando', 'Alien pulando', 'Gasparzinho voando',
  'Voldemort dançando', 'Dobby limpando', 'Malévola voando', 'Drácula mordendo', 'Diabo dançando',
  'Morte correndo', 'Coruja voando', 'Corvo bicando', 'Caveira rindo', 'Monstro dormindo',
  'Frankenstein andando', 'Esqueleto pulando', 'Múmia correndo', 'Abóbora pulando', 'Lobisomem dançando',
  'Saci pulando', 'Cuca correndo', 'Curupira dançando', 'Vampiro nadando', 'Bruxa correndo',
] as const
