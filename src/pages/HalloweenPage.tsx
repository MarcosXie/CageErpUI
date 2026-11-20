import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, Check, Copy, Crown, Drama, Ghost, GlassWater, Minus, Plus, ScrollText, Shuffle, Skull, Timer, Trophy, Users, VolumeX } from 'lucide-react'
import { api, getApiErrorMessage } from '../services/api'
import { CHARACTERS, GAMES, MIME_PROMPTS, PLAYER_NAMES, PLAYERS, RECORDED_MISSIONS, TEAMS, UNRECORDED_MISSIONS, type GameId, type Player, type Room, type ScoreChange } from '../halloween/data'
import { CHAMPIONSHIP_POINTS, comparePlayers, drawUnused, formatPoints, isRoom, totalScore } from '../halloween/gameLogic'
import { ChampionshipRules, DrinkGame, FantasyGame, GameCompletion, MimeTeams, SharedTimerGame, SurvivalGame } from '../halloween/HalloweenGames'
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
          <span>{PLAYER_NAMES[player].slice(0, 1)}</span><strong>{PLAYER_NAMES[player]}</strong><ArrowRight size={19} />
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
  const rows = game === 'mimica'
    ? TEAMS.map(team => ({ player: team.players[0], label: team.name }))
    : PLAYERS.map(player => ({ player, label: PLAYER_NAMES[player] }))
  const ranked = rows.sort((a, b) => comparePlayers(room, a.player, b.player, game))
  const locked = disabled || (!!game && room.completedGames.includes(game))
  const unit = game === 'sobrevivencia' ? 'SUSTOS' : game === 'fantasia' ? 'VOTOS' : 'PTS'
  return <section className="hw-panel hw-scoreboard" aria-label={game ? 'Placar do jogo' : 'Placar geral'}>
    <div className="hw-section-title"><div><span className="hw-eyebrow">{game ? 'CADA PONTO CONTA' : 'A DISPUTA DA NOITE'}</span><h2><Trophy size={22} /> {game ? 'Placar do jogo' : 'Placar geral'}</h2></div><span className="hw-live"><i /> AO VIVO</span></div>
    <ol>{ranked.map(({ player, label }) => {
      const score = totalScore(room, player, game)
      const rank = 1 + ranked.filter(other => comparePlayers(room, other.player, player, game) < 0).length
      return <li key={player}>
        <span className={`hw-rank ${rank === 1 ? 'hw-first' : ''}`}>{rank === 1 ? <Crown size={18} /> : `0${rank}`}</span>
        <span className={`hw-avatar hw-avatar-${PLAYERS.indexOf(player)}`}>{PLAYER_NAMES[player][0]}</span><strong>{label}</strong>
        {game && <button className="hw-score-control" aria-label={`Diminuir ${unit.toLowerCase()} de ${label}`} disabled={locked || ((game === 'sobrevivencia' || game === 'fantasia') && score <= 0)} onClick={() => onChange([{ player, game, delta: -1 }])}><Minus size={16} /></button>}
        <span className="hw-points">{formatPoints(score)}<small>{unit}</small></span>
        {game && <button className="hw-score-control" aria-label={`Aumentar ${unit.toLowerCase()} de ${label}`} disabled={locked} onClick={() => onChange([{ player, game, delta: 1 }])}><Plus size={16} /></button>}
      </li>
    })}</ol>
    <p className="hw-small">{game === 'mimica' ? 'Acertos da dupla. Cada integrante recebe a mesma colocação no campeonato.'
      : game === 'sobrevivencia' ? 'Menos sustos é melhor. Use +1 / −1 para registrar ou corrigir.'
        : game ? 'Resultado bruto do jogo. O ranking será convertido em pontos gerais ao concluir.'
          : `Pontos por colocação nos ${room.completedGames.length} de 7 jogos concluídos. Não é a soma dos resultados brutos.`}</p>
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
    <p>Uma missão com registro e outra sem. Só {PLAYER_NAMES[player]} deve olhar para a tela agora.</p>
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
    <p className="hw-small">No fim da noite, a turma valida as missões: +1 por missão cumprida (0, 1 ou 2 por pessoa). Depois conclua o jogo para pontuar o campeonato.</p>
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
    {mime && <MimeTeams player={player} />}
    <p>{mime ? `${PLAYER_NAMES[player]} faz a mímica para o parceiro. Acerto soma +1 para a dupla inteira. Alternem quem interpreta a cada vez; deem a mesma quantidade de tentativas às duas duplas.`
      : `É a vez de ${PLAYER_NAMES[player]}. Sorteie sem olhar, coloque o celular na testa e peça para alguém revelar. Façam o mesmo número de tentativas por pessoa; cada acerto vale +1.`}</p>
    {local.error && <Notice>{local.error}</Notice>}
    {state.current === null ? <>
      <div className="hw-secret">{mime ? <Drama size={64} /> : <Ghost size={64} />}<span>{state.used.length === 100 ? 'Baralho esgotado!' : 'Prontos para a próxima criatura?'}</span></div>
      <button className="hw-button" disabled={state.used.length === 100 || !!local.error || disabled} onClick={draw}><Shuffle size={18} /> Sortear</button>
    </> : !state.revealed ? <div className="hw-forehead">
      <Ghost size={58} /><h3>Carta preparada. Não olhe!</h3><p>Celular na testa, tela para a turma.</p>
      <button className="hw-button" onClick={() => local.save({ ...state, revealed: true })}>Revelar para a turma</button>
    </div> : <>
      <div className="hw-prompt" aria-live="polite">{prompts[state.current]}</div>
      <div className="hw-actions"><button className="hw-button" disabled={disabled} onClick={() => finish(true)}><Check size={18} /> {mime ? 'Dupla acertou +1' : 'Acertou +1'}</button>
        <button className="hw-button hw-secondary" disabled={disabled} onClick={() => finish(false)}>Passar / esconder <ArrowRight size={18} /></button></div>
    </>}
    <p className="hw-small"><VolumeX size={14} /> {mime ? 'Sem sons e sem palavras. Só atuação.' : 'Dica: vire o celular na horizontal para uma carta maior.'} Nenhuma carta se repete até o baralho acabar.</p>
    {state.used.length === 100 && state.current === null && (confirmReset
      ? <div className="hw-actions"><span>Reembaralhar as 100 cartas?</span><button className="hw-button hw-secondary" onClick={() => { local.save(newDeck()); setConfirmReset(false) }}>Confirmar</button></div>
      : <button className="hw-text-button" onClick={() => setConfirmReset(true)}>Reembaralhar baralho</button>)}
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
    {(shared.liveError || shared.clockError) && <Notice>{shared.liveError || shared.clockError}</Notice>}
    {shared.pending && <Notice>Há uma ação aguardando confirmação. Reenvie com segurança. <button className="hw-text-button" disabled={shared.busy} onClick={shared.retry}>{shared.busy ? 'Enviando…' : 'Reenviar ação pendente'}</button>
      {shared.canDiscard && <button className="hw-text-button" onClick={shared.discard}>Descartar ação recusada</button>}</Notice>}
    <Routes>
      <Route index element={<>
        <section className="hw-hero"><div><span className="hw-eyebrow"><span className="hw-tiny-line" /> A NOITE É NOSSA</span><h1>Travessuras,<br />sustos e <em>disputa.</em></h1><p>O covil das Lagartixas Tetraplégicas está aberto.<br />Escolha um jogo. Cumpra sua missão. Domine o placar.</p>
          <a className="hw-button" href="#hw-games">Que comecem os jogos <ArrowDown size={18} /></a><div className="hw-hero-meta"><span><Users size={16} /> 4 jogadores</span><span><Drama size={16} /> 7 jogos</span><span><Ghost size={16} /> zero normalidade</span></div></div>
          <figure className="hw-photo"><img src={photo} alt="Lagartixa bruxa, mascote da noite, cercada por abóboras" /><figcaption><span>PROCURADA POR</span> EXCESSO DE TRAVESSURAS</figcaption><span className="hw-photo-sticker">BOO!</span></figure>
        </section>
        <div className="hw-home-grid"><section id="hw-games"><div className="hw-section-title"><div><span className="hw-eyebrow">ESCOLHA SEU DESTINO</span><h2>O que vamos jogar?</h2></div><span className="hw-muted">07 JOGOS</span></div>
          <div className="hw-game-grid">{GAMES.map((game, index) => {
            const Icon = icons[game.icon]
            return <Link key={game.id} to={to(`/${game.id}`)} className={`hw-game-card hw-game-card-${index}`}><div className="hw-card-top"><span className="hw-card-icon"><Icon size={24} /></span><span className="hw-tag">{game.tag}</span></div><h3>{game.title}</h3><p>{game.description}</p>
              <div className={`hw-card-prize${game.id === 'fantasia' ? ' hw-card-prize-top' : ''}`}><Trophy size={18} /><div><strong>{CHAMPIONSHIP_POINTS[game.id][0]} <small>pts</small></strong><span>{game.id === 'mimica' ? 'No geral por integrante da dupla vencedora' : game.id === 'fantasia' ? 'Maior prêmio da noite · 1º lugar no geral' : 'Para o 1º lugar no geral'}</span></div></div>
              <span className="hw-card-link">{game.subtitle}<ArrowRight size={17} /></span></Link>
          })}</div></section><aside><Scoreboard room={room} disabled={disabled} onChange={shared.changeScores} /><div className="hw-note"><Ghost size={23} /><p>A única regra universal:<br /><strong>todo mundo se diverte.</strong><br />Respeite os limites da turma.</p></div></aside></div>
        <ChampionshipRules />
      </>} />
      {GAMES.map(game => <Route key={game.id} path={game.id} element={<>
        <Link className="hw-back" to={to()}><ArrowLeft size={17} /> Todos os jogos</Link>
        <header className="hw-game-header"><span className="hw-eyebrow">{game.subtitle}</span><h1>{game.title}</h1></header>
        <div className="hw-game-layout"><div>
          {game.id === 'missoes' ? <Missions id={id} player={player} />
            : game.id === 'mimica' || game.id === 'quem-sou-eu' ? <DeckGame key={`${game.id}:${player}`} id={id} player={player} mime={game.id === 'mimica'} disabled={disabled || room.completedGames.includes(game.id)} onChange={shared.changeScores} />
              : game.id === 'timer' ? <SharedTimerGame room={room} player={player} sync={shared} />
                : game.id === 'drink-russo' ? <DrinkGame key={player} room={room} player={player} disabled={disabled || room.completedGames.includes(game.id)} act={shared.act} />
                  : game.id === 'fantasia' ? <FantasyGame room={room} disabled={disabled || room.completedGames.includes(game.id)} act={shared.act} />
                    : <SurvivalGame room={room} disabled={disabled || room.completedGames.includes(game.id)} act={shared.act} clock={shared.clock} onChange={shared.changeScores} />}
        </div><aside><Scoreboard room={room} game={game.id} disabled={disabled} onChange={shared.changeScores} /><GameCompletion room={room} game={game.id} disabled={disabled} act={shared.act} /><Scoreboard room={room} disabled={disabled} onChange={shared.changeScores} /></aside></div>
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
        <div className="hw-header-right"><span className="hw-header-label">EDIÇÃO HALLOWEEN</span>{player.value && <label className="hw-player-select"><span>Jogando como</span><select aria-label="Selecionar jogador" value={player.value} onChange={event => player.save(event.target.value as Player)}>{PLAYERS.map(name => <option key={name} value={name}>{PLAYER_NAMES[name]}</option>)}</select></label>}</div>
      </header>
      {player.error && <Notice>{player.error}</Notice>}
      {!player.value ? <PlayerPicker onSelect={name => player.save(name)} />
        : id !== null && !validId ? <section className="hw-panel hw-loading"><Notice>Link de sala inválido.</Notice><Link to="/halloween">Voltar para entrada</Link></section>
          : validId ? <RoomExperience key={id} id={id.toLowerCase()} player={player.value} /> : <RoomEntry />}
      <footer className="hw-footer"><span><Ghost size={15} /> LAGARTIXAS TETRAPLÉGICAS</span><span>Feito para uma noite nada normal. <span aria-hidden="true">✦</span></span></footer>
    </div>
  </div>
}
