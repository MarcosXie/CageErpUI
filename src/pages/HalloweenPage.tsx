import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, Check, Copy, Crown, Drama, Ghost, GlassWater, Minus, Plus, ScrollText, Shuffle, Skull, Timer, Trophy, Users, VolumeX } from 'lucide-react'
import { api, getApiErrorMessage } from '../services/api'
import { CHARACTERS, GAMES, MANUAL_RULES, MIME_PROMPTS, PLAYERS, RECORDED_MISSIONS, UNRECORDED_MISSIONS, type GameId, type Player, type Room, type ScoreChange } from '../halloween/data'
import { createTimerMatch, drawUnused, isRoom, roundPoints, timerTotals, totalScore, type TimerMatch } from '../halloween/gameLogic'
import { useHalloweenRoom, useSessionValue } from '../halloween/useHalloweenRoom'
import './HalloweenPage.css'

const icons = { scroll: ScrollText, drama: Drama, glass: GlassWater, ghost: Ghost, timer: Timer, skull: Skull, crown: Crown }
const isPlayer = (value: unknown): value is Player | null => value === null || PLAYERS.some(player => player === value)
const photo = '/halloween/lagartixa.png'

function Notice({ children }: { children: ReactNode }) {
  return <div className="hw-notice" role="alert">{children}</div>
}

function PlayerPicker({ onSelect }: { onSelect: (player: Player) => void }) {
  return <div className="hw-entry">
    <section>
      <span className="hw-eyebrow"><Ghost size={17} /> UMA NOITE. MUITAS TRAVESSURAS.</span>
      <h1>O susto é certo.<br />A vitória é <em>sua?</em></h1>
      <p className="hw-lead">Bem-vindo ao Halloween das<br /><strong>Lagartixas Tetraplégicas.</strong></p>
      <p>Escolha seu jogador para entrar na brincadeira.</p>
      <div className="hw-player-grid">{PLAYERS.map((player, index) =>
        <button key={player} className={`hw-player hw-player-${index}`} onClick={() => onSelect(player)}>
          <span>{player.slice(0, 1)}</span><strong>{player}</strong><ArrowRight size={19} />
        </button>)}</div>
      <span className="hw-muted"><Users size={15} /> 4 amigos · 7 jogos · uma noite para lembrar</span>
    </section>
    <figure className="hw-photo"><img src={photo} alt="Lagartixa fantasiada de bruxa entre abóboras de Halloween" /><figcaption>O CONSELHO DAS LAGARTIXAS CONVOCA VOCÊ.</figcaption></figure>
  </div>
}

function RoomEntry() {
  const navigate = useNavigate()
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const create = async () => {
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post<unknown>('/halloween/sessions')
      if (!isRoom(data)) throw new Error('Resposta inválida.')
      navigate(`/halloween?s=${data.id}`)
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Não foi possível criar a sala. Confira se a API está disponível.'))
    } finally { setBusy(false) }
  }
  const join = () => {
    let id = link.trim()
    try { id = new URL(id).searchParams.get('s') || '' } catch { /* A bare room ID is also accepted. */ }
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) {
      setError('Cole o link completo da sala ou um identificador válido.')
      return
    }
    navigate(`/halloween?s=${id.toLowerCase()}`)
  }
  return <section className="hw-room-entry hw-panel">
    <span className="hw-eyebrow">JUNTEM A TURMA</span>
    <h1>Uma sala.<br /><em>A noite toda.</em></h1>
    <p>Uma pessoa cria a sala e compartilha o link com os outros três. Assim, todos veem o mesmo placar.</p>
    {error && <Notice>{error}</Notice>}
    <button className="hw-button" disabled={busy} onClick={() => void create()}>{busy ? 'Criando…' : 'Criar sala da festa'} <Plus size={18} /></button>
    <div className="hw-divider">OU ENTRE EM UMA SALA</div>
    <form onSubmit={event => { event.preventDefault(); join() }}>
      <label htmlFor="hw-room-link">Link ou identificador da sala</label>
      <input id="hw-room-link" value={link} onChange={event => setLink(event.target.value)} placeholder="Cole o link que recebeu" autoComplete="off" />
      <button className="hw-button hw-secondary" disabled={busy || !link.trim()}>Entrar na sala <ArrowRight size={18} /></button>
    </form>
    <p className="hw-small">Não há senha: quem tem o link pode editar os pontos. Compartilhe apenas com a turma.</p>
  </section>
}

function Scoreboard({ room, game, disabled, onChange }: { room: Room; game?: GameId; disabled: boolean; onChange: (changes: ScoreChange[]) => void }) {
  const ranked = [...PLAYERS].sort((a, b) => totalScore(room, b, game) - totalScore(room, a, game))
  return <section className="hw-panel hw-scoreboard" aria-label={game ? 'Placar do jogo' : 'Placar geral'}>
    <div className="hw-section-title"><div><span className="hw-eyebrow">{game ? 'CADA PONTO CONTA' : 'A DISPUTA DA NOITE'}</span><h2><Trophy size={22} /> {game ? 'Placar do jogo' : 'Placar geral'}</h2></div><span className="hw-live"><i /> AO VIVO</span></div>
    <ol>{ranked.map(player => {
      const score = totalScore(room, player, game)
      const rank = 1 + ranked.filter(other => totalScore(room, other, game) > score).length
      return <li key={player}>
        <span className={`hw-rank ${rank === 1 ? 'hw-first' : ''}`}>{rank === 1 ? <Crown size={18} /> : `0${rank}`}</span>
        <span className={`hw-avatar hw-avatar-${PLAYERS.indexOf(player)}`}>{player[0]}</span><strong>{player}</strong>
        {game && <button className="hw-score-control" aria-label={`Diminuir pontos de ${player}`} disabled={disabled} onClick={() => onChange([{ player, game, delta: -1 }])}><Minus size={16} /></button>}
        <span className="hw-points">{score}<small>PTS</small></span>
        {game && <button className="hw-score-control" aria-label={`Aumentar pontos de ${player}`} disabled={disabled} onClick={() => onChange([{ player, game, delta: 1 }])}><Plus size={16} /></button>}
      </li>
    })}</ol>
    <p className="hw-small">{game ? 'Ajustes manuais de +1 / −1. Atualiza o total da noite.' : 'Soma dos sete jogos. Ajuste pontos dentro de cada jogo.'}</p>
  </section>
}

interface PrivateState {
  recorded: number[]
  unrecorded: number[]
  mission: { recorded: number; unrecorded: number; player: Player } | null
}
const newPrivateState = (): PrivateState => ({ recorded: [], unrecorded: [], mission: null })
function isPrivateState(value: unknown): value is PrivateState {
  if (!value || typeof value !== 'object') return false
  const state = value as PrivateState
  const indices = (items: unknown, length: number): items is number[] => Array.isArray(items)
    && items.every(index => Number.isInteger(index) && index >= 0 && index < length)
  return indices(state.recorded, 7) && indices(state.unrecorded, 7)
    && (state.mission === null || (!!state.mission && PLAYERS.includes(state.mission.player)
      && indices([state.mission.recorded, state.mission.unrecorded], 7)))
}

function Missions({ id, player }: { id: string; player: Player }) {
  const local = useSessionValue(`halloween.missions.${id}`, newPrivateState, isPrivateState)
  const state = local.value
  const mission = state.mission?.player === player ? state.mission : null
  const exhausted = state.recorded.length >= 7 || state.unrecorded.length >= 7
  const draw = () => {
    const recorded = drawUnused(7, state.recorded)
    const unrecorded = drawUnused(7, state.unrecorded)
    if (recorded === null || unrecorded === null) return
    local.save({ recorded: [...state.recorded, recorded], unrecorded: [...state.unrecorded, unrecorded], mission: { recorded, unrecorded, player } })
  }
  return <section className="hw-panel hw-play">
    <span className="hw-game-symbol"><ScrollText /></span><h2>Seu segredo começa aqui.</h2>
    <p>Uma missão com registro e outra sem. Só {player} deve olhar para a tela agora.</p>
    {local.error && <Notice>{local.error}</Notice>}
    {mission ? <>
      <div className="hw-missions">
        <article><span className="hw-eyebrow">01 / COM REGISTRO</span><h3>{RECORDED_MISSIONS[mission.recorded].title}</h3><p>{RECORDED_MISSIONS[mission.recorded].text}</p></article>
        <article><span className="hw-eyebrow">02 / SEM REGISTRO</span><h3>{UNRECORDED_MISSIONS[mission.unrecorded].title}</h3><p>{UNRECORDED_MISSIONS[mission.unrecorded].text}</p></article>
      </div>
      <button className="hw-button" onClick={() => local.save({ ...state, mission: null })}><Check size={18} /> Terminei</button>
      <p className="hw-small">“Terminei” esconde as missões, sem marcar pontos. Passe o celular e troque o jogador no topo.</p>
    </> : <>
      <div className="hw-secret"><Ghost size={56} /><span>O que acontece na missão<br />fica na missão.</span></div>
      <button className="hw-button" disabled={exhausted || !!local.error} onClick={draw}><Shuffle size={18} /> Sortear minhas missões</button>
      <p className="hw-small">{exhausted ? 'Todas as duplas já foram sorteadas nesta sessão do navegador.' : `${7 - state.recorded.length} duplas restantes · sem repetição nesta aba, mesmo ao recarregar`}</p>
    </>}
    <p className="hw-small">Fotos e vídeos ficam com vocês; não enviamos registros. Respeitem o consentimento e os limites de todos.</p>
  </section>
}

interface DeckState { used: number[]; current: number | null; revealed: boolean }
const newDeck = (): DeckState => ({ used: [], current: null, revealed: false })
function isDeck(value: unknown): value is DeckState {
  if (!value || typeof value !== 'object') return false
  const state = value as DeckState
  return Array.isArray(state.used) && state.used.every(index => Number.isInteger(index) && index >= 0 && index < 100)
    && (state.current === null || (Number.isInteger(state.current) && state.current >= 0 && state.current < 100))
    && typeof state.revealed === 'boolean'
}

function DeckGame({ id, player, mime, disabled, onChange }: { id: string; player: Player; mime: boolean; disabled: boolean; onChange: (changes: ScoreChange[]) => void }) {
  const local = useSessionValue(`halloween.deck.${mime ? 'mime' : 'who'}.${id}`, newDeck, isDeck)
  const state = local.value
  const [confirmReset, setConfirmReset] = useState(false)
  const prompts = mime ? MIME_PROMPTS : CHARACTERS
  const draw = () => {
    const next = drawUnused(prompts.length, state.used)
    if (next !== null) local.save({ used: [...state.used, next], current: next, revealed: mime })
  }
  const finish = (correct: boolean) => {
    if (!local.save({ ...state, current: null, revealed: false })) return
    if (correct) onChange([{ player, game: mime ? 'mimica' : 'quem-sou-eu', delta: 1 }])
  }
  return <section className={`hw-panel hw-play ${state.revealed ? 'hw-card-active' : ''}`}>
    <span className="hw-eyebrow">{state.used.length} / 100 CARTAS SORTEADAS</span>
    <h2>{mime ? 'O corpo fala. Você não.' : 'Todo mundo sabe. Menos você.'}</h2>
    <p>{mime ? `${player} faz a mímica. Combinem quem recebe o ponto por acerto; por padrão ele vai para ${player}.` : `É a vez de ${player}. Sorteie sem olhar, coloque o celular na testa e peça para alguém revelar. Faça perguntas de sim ou não!`}</p>
    {local.error && <Notice>{local.error}</Notice>}
    {state.current === null ? <>
      <div className="hw-secret">{mime ? <Drama size={64} /> : <Ghost size={64} />}<span>{state.used.length === 100 ? 'Baralho esgotado!' : 'Prontos para a próxima criatura?'}</span></div>
      <button className="hw-button" disabled={state.used.length === 100 || !!local.error || disabled} onClick={draw}><Shuffle size={18} /> Sortear</button>
    </> : !state.revealed ? <div className="hw-forehead">
      <Ghost size={58} /><h3>Carta preparada. Não olhe!</h3><p>Celular na testa, tela para a turma.</p>
      <button className="hw-button" onClick={() => local.save({ ...state, revealed: true })}>Revelar para a turma</button>
    </div> : <>
      <div className="hw-prompt" aria-live="polite">{prompts[state.current]}</div>
      <div className="hw-actions"><button className="hw-button" disabled={disabled} onClick={() => finish(true)}><Check size={18} /> Acertou +1</button>
        <button className="hw-button hw-secondary" disabled={disabled} onClick={() => finish(false)}>Passar / esconder <ArrowRight size={18} /></button></div>
    </>}
    <p className="hw-small"><VolumeX size={14} /> {mime ? 'Sem sons e sem palavras. Só atuação.' : 'Dica: vire o celular na horizontal para uma carta maior.'} Nenhuma carta se repete até o baralho acabar.</p>
    {state.used.length === 100 && state.current === null && (confirmReset
      ? <div className="hw-actions"><span>Reembaralhar as 100 cartas?</span><button className="hw-button hw-secondary" onClick={() => { local.save(newDeck()); setConfirmReset(false) }}>Confirmar</button></div>
      : <button className="hw-text-button" onClick={() => setConfirmReset(true)}>Reembaralhar baralho</button>)}
  </section>
}

function isTimerMatch(value: unknown): value is TimerMatch {
  if (!value || typeof value !== 'object') return false
  const match = value as TimerMatch
  return typeof match.id === 'string' && Array.isArray(match.rounds) && match.rounds.length === 5
    && Number.isInteger(match.round) && match.round >= 0 && match.round < 5
    && (match.startedAt === null || (Number.isFinite(match.startedAt) && match.startedAt > 0))
    && match.rounds.every(round => Number.isInteger(round.target) && round.target >= 3 && round.target <= 30
      && Array.isArray(round.turns) && round.turns.length <= 4 && round.turns.every((turn, index) =>
        turn.player === PLAYERS[index] && Number.isFinite(turn.elapsedMs) && turn.elapsedMs >= 0))
}

function TimerGame({ id, room, disabled, onChange }: { id: string; room: Room; disabled: boolean; onChange: (changes: ScoreChange[], operationId?: string) => void }) {
  const local = useSessionValue(`halloween.timer.${id}`, createTimerMatch, isTimerMatch)
  const match = local.value
  const round = match.rounds[match.round]
  const roundDone = round.turns.length === 4
  const done = match.round === 4 && roundDone
  const turnPlayer = PLAYERS[round.turns.length]
  const [confirmNew, setConfirmNew] = useState(false)
  const totals = timerTotals(match)
  const awarded = room.appliedOperations.includes(match.id)
  const press = () => {
    if (match.startedAt === null) {
      local.save({ ...match, startedAt: performance.timeOrigin + performance.now() })
    } else {
      const elapsedMs = Math.max(0, Math.round(performance.timeOrigin + performance.now() - match.startedAt))
      local.save({ ...match, startedAt: null, rounds: match.rounds.map((item, index) => index === match.round
        ? { ...item, turns: [...item.turns, { player: turnPlayer, elapsedMs }] } : item) })
    }
  }
  return <section className="hw-panel hw-play">
    <span className="hw-eyebrow">RODADA {match.round + 1} DE 5 · MESMO ALVO PARA TODOS</span>
    <h2>{done ? 'O tempo revelou o vencedor.' : roundDone ? 'Rodada encerrada!' : `Sua vez, ${turnPlayer}.`}</h2>
    <p>Clique uma vez para iniciar e outra para parar. O relógio fica escondido. Quanto menor o erro, melhor!</p>
    {local.error && <Notice>{local.error}</Notice>}
    {!roundDone && <>
      <div className="hw-target"><span>TEMPO-ALVO</span><strong>{round.target}<small>seg</small></strong></div>
      <button className={`hw-timer-button ${match.startedAt !== null ? 'hw-running' : ''}`} onClick={press} disabled={!!local.error}>
        <Timer size={30} />{match.startedAt !== null ? 'PARAR' : 'INICIAR'}<small>{match.startedAt !== null ? 'Confie na sua intuição…' : 'Respire fundo. Concentre-se.'}</small>
      </button>
      <p className="hw-small">{round.turns.length} de 4 jogadores já tentaram. O resultado aparece só no fim da rodada.</p>
    </>}
    {roundDone && <>
      <div className="hw-table-wrap"><table className="hw-results"><caption>Resultado da rodada · alvo {round.target}s</caption><thead><tr><th>Jogador</th><th>Tempo</th><th>Erro</th><th>Pontos</th></tr></thead>
        <tbody>{[...round.turns].sort((a, b) => Math.abs(a.elapsedMs - round.target * 1000) - Math.abs(b.elapsedMs - round.target * 1000)).map(turn =>
          <tr key={turn.player}><th>{turn.player}</th><td>{(turn.elapsedMs / 1000).toFixed(3)}s</td><td>{(Math.abs(turn.elapsedMs - round.target * 1000) / 1000).toFixed(3)}s</td><td>+{roundPoints(round)[turn.player]}</td></tr>)}</tbody></table></div>
      {!done && <button className="hw-button" onClick={() => local.save({ ...match, round: match.round + 1 })}>Próxima rodada <ArrowRight size={18} /></button>}
    </>}
    {done && <>
      <h3>Resultado final da partida</h3>
      <div className="hw-final">{[...PLAYERS].sort((a, b) => totals[b] - totals[a]).map(player => <div key={player}><span>{totals[player] === Math.max(...Object.values(totals)) && <Crown size={18} />} {player}</span><strong>{totals[player]} pts</strong></div>)}</div>
      <button className="hw-button" disabled={disabled || awarded} onClick={() => onChange(PLAYERS.map(player => ({ player, game: 'timer', delta: totals[player] })), match.id)}><Trophy size={18} />{awarded ? 'Resultado salvo no placar!' : 'Salvar resultado no placar'}</button>
      {awarded && (confirmNew ? <button className="hw-button hw-secondary" onClick={() => { local.save(createTimerMatch()); setConfirmNew(false) }}>Confirmar nova partida</button> : <button className="hw-text-button" onClick={() => setConfirmNew(true)}>Jogar outra partida</button>)}
    </>}
    <p className="hw-small">Por rodada: 4 / 3 / 2 / 1 pontos por proximidade. Empates no milissegundo recebem a mesma posição; a seguinte é pulada. Cinco alvos progressivos até 30s. O resultado final é somado ao placar apenas uma vez.</p>
    <p className="hw-small">Joguem a partida neste aparelho, alternando os quatro jogadores. O progresso fica nesta aba; o placar final é compartilhado com os outros celulares.</p>
  </section>
}

function ManualGame({ game }: { game: keyof typeof MANUAL_RULES }) {
  return <section className="hw-panel hw-play"><span className="hw-game-symbol"><Users /></span><h2>A brincadeira é com vocês.</h2><p>Esta é uma atividade presencial, com pontuação manual e regras combinadas pela turma.</p>
    <ol className="hw-rules">{MANUAL_RULES[game].map((rule, index) => <li key={rule}><span>0{index + 1}</span><p>{rule}</p></li>)}</ol>
    {game === 'drink-russo' && <p className="hw-small">Sem obrigação, sem misturas desconhecidas e sem desafios de quantidade. Água e bebidas sem álcool fazem parte da brincadeira.</p>}
  </section>
}

function RoomExperience({ id, player }: { id: string; player: Player }) {
  const shared = useHalloweenRoom(id)
  const [search] = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const room = shared.room
  const to = (path = '') => `/halloween${path}?s=${encodeURIComponent(search.get('s') || id)}`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/halloween?s=${id}`)
      setCopied(true)
      setCopyError('')
    } catch { setCopyError('Não foi possível copiar. Copie o endereço da barra do navegador e envie à turma.') }
  }
  if (!room) return <section className="hw-panel hw-loading"><Ghost size={48} /><h1>Invocando a sala…</h1>{shared.error && <Notice>{shared.error}</Notice>}<Link className="hw-text-button" to="/halloween">Voltar para entrada</Link></section>
  const disabled = shared.busy || !!shared.pending || !!shared.error
  return <>
    <div className="hw-room-bar"><span><i className={`hw-dot ${shared.error ? 'hw-offline' : ''}`} /> {shared.error ? 'Sincronização interrompida' : 'Sala conectada'} <span className="hw-room-code">/ {id.slice(0, 8).toUpperCase()}</span></span>
      <button className="hw-text-button" onClick={() => void copy()}><Copy size={15} /> {copied ? 'Link copiado!' : 'Convidar a turma'}</button></div>
    {(shared.error || copyError) && <Notice>{shared.error || copyError}</Notice>}
    {shared.pending && <Notice>Há pontos aguardando confirmação. Você pode reenviar com segurança. <button className="hw-text-button" disabled={shared.busy} onClick={shared.retry}>{shared.busy ? 'Enviando…' : 'Reenviar pontos pendentes'}</button></Notice>}
    <Routes>
      <Route index element={<>
        <section className="hw-hero"><div><span className="hw-eyebrow"><span className="hw-tiny-line" /> A NOITE É NOSSA</span><h1>Travessuras,<br />sustos e <em>disputa.</em></h1><p>O covil das Lagartixas Tetraplégicas está aberto.<br />Escolha um jogo. Cumpra sua missão. Domine o placar.</p>
          <a className="hw-button" href="#hw-games">Que comecem os jogos <ArrowDown size={18} /></a><div className="hw-hero-meta"><span><Users size={16} /> 4 jogadores</span><span><Drama size={16} /> 7 jogos</span><span><Ghost size={16} /> zero normalidade</span></div></div>
          <figure className="hw-photo"><img src={photo} alt="Lagartixa bruxa, mascote da noite, cercada por abóboras" /><figcaption><span>PROCURADA POR</span> EXCESSO DE TRAVESSURAS</figcaption><span className="hw-photo-sticker">BOO!</span></figure>
        </section>
        <div className="hw-home-grid"><section id="hw-games"><div className="hw-section-title"><div><span className="hw-eyebrow">ESCOLHA SEU DESTINO</span><h2>O que vamos jogar?</h2></div><span className="hw-muted">07 JOGOS</span></div>
          <div className="hw-game-grid">{GAMES.map((game, index) => {
            const Icon = icons[game.icon]
            return <Link key={game.id} to={to(`/${game.id}`)} className={`hw-game-card hw-game-card-${index}`}><div className="hw-card-top"><span className="hw-card-icon"><Icon size={24} /></span><span className="hw-tag">{game.tag}</span></div><h3>{game.title}</h3><p>{game.description}</p><span className="hw-card-link">{game.subtitle}<ArrowRight size={17} /></span></Link>
          })}</div></section><aside><Scoreboard room={room} disabled={disabled} onChange={shared.changeScores} /><div className="hw-note"><Ghost size={23} /><p>A única regra universal:<br /><strong>todo mundo se diverte.</strong><br />Respeite os limites da turma.</p></div></aside></div>
      </>} />
      {GAMES.map(game => <Route key={game.id} path={game.id} element={<>
        <Link className="hw-back" to={to()}><ArrowLeft size={17} /> Todos os jogos</Link>
        <header className="hw-game-header"><span className="hw-eyebrow">{game.subtitle}</span><h1>{game.title}</h1></header>
        <div className="hw-game-layout"><div>
          {game.id === 'missoes' ? <Missions id={id} player={player} />
            : game.id === 'mimica' || game.id === 'quem-sou-eu' ? <DeckGame key={game.id} id={id} player={player} mime={game.id === 'mimica'} disabled={disabled} onChange={shared.changeScores} />
              : game.id === 'timer' ? <TimerGame id={id} room={room} disabled={disabled} onChange={shared.changeScores} />
                : <ManualGame game={game.id} />}
        </div><aside><Scoreboard room={room} game={game.id} disabled={disabled} onChange={shared.changeScores} /><Scoreboard room={room} disabled={disabled} onChange={shared.changeScores} /></aside></div>
      </>} />)}
      <Route path="*" element={<Navigate to={to()} replace />} />
    </Routes>
  </>
}

export default function HalloweenPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Halloween das Lagartixas'
    return () => { document.title = previousTitle }
  }, [])
  const player = useSessionValue<Player | null>('halloween.player', () => null, isPlayer)
  const [search] = useSearchParams()
  const id = search.get('s')
  const validId = id !== null && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)
  return <div className="hw">
    <div className="hw-shell">
      <header className="hw-header"><Link to={validId ? `/halloween?s=${id}` : '/halloween'} className="hw-brand"><span className="hw-brand-icon"><Ghost size={27} /></span><span>LAGARTIXAS<span>HALLOWEEN CLUB</span></span></Link>
        <div className="hw-header-right"><span className="hw-header-label">EDIÇÃO HALLOWEEN</span>{player.value && <label className="hw-player-select"><span>Jogando como</span><select aria-label="Selecionar jogador" value={player.value} onChange={event => player.save(event.target.value as Player)}>{PLAYERS.map(name => <option key={name}>{name}</option>)}</select></label>}</div>
      </header>
      {player.error && <Notice>{player.error}</Notice>}
      {!player.value ? <PlayerPicker onSelect={name => player.save(name)} />
        : id !== null && !validId ? <section className="hw-panel hw-loading"><Notice>Link de sala inválido.</Notice><Link to="/halloween">Voltar para entrada</Link></section>
          : validId ? <RoomExperience key={id} id={id.toLowerCase()} player={player.value} /> : <RoomEntry />}
      <footer className="hw-footer"><span><Ghost size={15} /> LAGARTIXAS TETRAPLÉGICAS</span><span>Feito para uma noite nada normal. <span aria-hidden="true">✦</span></span></footer>
    </div>
  </div>
}
