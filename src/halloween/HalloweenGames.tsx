import { useEffect, useState } from 'react'
import { Check, Crown, ExternalLink, Timer, Trophy } from 'lucide-react'
import { GAMES, PLAYER_NAMES, PLAYERS, TEAMS, type Act, type GameId, type Player, type Room, type ScoreChange, type TimerRound } from './data'
import { championshipPoints, CHAMPIONSHIP_POINTS, formatPoints, monotonicEpoch, type ClockEstimate } from './gameLogic'
import type { useHalloweenRoom } from './useHalloweenRoom'

type Sync = ReturnType<typeof useHalloweenRoom>
const name = (player: Player) => PLAYER_NAMES[player]

function useServerNow(clock: ClockEstimate | null) {
  const [epoch, setEpoch] = useState(monotonicEpoch)
  useEffect(() => {
    const timer = setInterval(() => setEpoch(monotonicEpoch()), 50)
    return () => clearInterval(timer)
  }, [])
  return clock ? epoch + clock.offsetMs : null
}

export function ChampionshipRules() {
  return <section className="hw-panel hw-championship"><span className="hw-eyebrow">COMO GANHAR A NOITE</span><h2>O campeonato</h2>
    <p>O placar de cada jogo define sua colocação. Só os jogos concluídos entram no geral, com os pesos abaixo.</p>
    <div className="hw-table-wrap"><table className="hw-results"><thead><tr><th>Jogo</th><th>1º</th><th>2º</th><th>3º</th><th>4º</th></tr></thead>
      <tbody>{GAMES.map(game => <tr key={game.id}><th>{game.title}</th>{[0, 1, 2, 3].map(index => <td key={index}>{CHAMPIONSHIP_POINTS[game.id][index] ?? '—'}</td>)}</tr>)}</tbody></table></div>
    <p className="hw-small">Empates dividem a média dos pontos das posições ocupadas. Na mímica são duas duplas: cada integrante recebe os pontos da dupla ({CHAMPIONSHIP_POINTS.mimica.join(' / ')}; empate = {formatPoints(CHAMPIONSHIP_POINTS.mimica.reduce((sum, points) => sum + points, 0) / CHAMPIONSHIP_POINTS.mimica.length)}). No terror, menos sustos é melhor. Mais rodadas não aumentam o peso do jogo no geral.</p>
  </section>
}

export function CanGame({ disabled, onChange }: { disabled: boolean; onChange: (changes: ScoreChange[]) => void }) {
  const [winner, setWinner] = useState<Player | ''>('')
  return <section className="hw-panel hw-play"><span className="hw-eyebrow">UMA VITÓRIA POR RODADA</span>
    <h2>Desafio da lata</h2>
    <p>Os quatro jogadores participam vendados; quem tocar o alvo com o pé primeiro vence a rodada. Depois, escolha o vencedor e registre +1 ponto. Combinem antes quantas rodadas serão jogadas.</p>
    <div className="hw-rule-box"><strong>Segurança primeiro</strong><p>Prefiram um alvo macio no lugar da lata, mantenham o espaço livre e tenham uma pessoa de fora para acompanhar e interromper a brincadeira se necessário.</p></div>
    <form className="hw-form" onSubmit={event => {
      event.preventDefault()
      if (winner) onChange([{ player: winner, game: 'lata', delta: 1 }])
    }}><label htmlFor="hw-can-winner">Vencedor da rodada</label>
      <select id="hw-can-winner" value={winner} onChange={event => setWinner(event.target.value as Player | '')}>
        <option value="">Selecione o vencedor</option>{PLAYERS.map(player => <option value={player} key={player}>{name(player)}</option>)}
      </select>
      <button className="hw-button" disabled={disabled || !winner}>Registrar vitória +1</button>
    </form>
    <p className="hw-small">Registre uma vez por rodada. Use −1 no placar para corrigir; conclua o jogo depois da última rodada.</p>
  </section>
}

export function FilmGame({ disabled, onChange }: { disabled: boolean; onChange: (changes: ScoreChange[]) => void }) {
  const [player, setPlayer] = useState<Player | ''>('')
  const [attempt, setAttempt] = useState('')
  return <section className="hw-panel hw-play"><span className="hw-eyebrow">TRÊS CHANCES · UM FILME</span>
    <h2>Adivinhe o filme</h2>
    <p>Enquanto uma pessoa não vê a TV, a turma escolhe um filme e informa apenas sua duração. Ela escolhe um momento; mostrem a imagem desse instante para ela adivinhar.</p>
    <p>Se errar, escolha outro instante do mesmo filme e tente novamente, até três tentativas. Acertou? Registrem o resultado uma vez; três erros valem zero. Repitam para os demais, com a mesma quantidade de filmes por jogador.</p>
    <div className="hw-rule-box"><strong>Pontos por filme</strong><p>Acerto na 1ª tentativa: +3; na 2ª: +2; na 3ª: +1. Sem acerto: 0.</p></div>
    <form className="hw-form" onSubmit={event => {
      event.preventDefault()
      const points = Number(attempt)
      if (player && points >= 1 && points <= 3)
        onChange([{ player, game: 'filme', delta: points }])
    }}>
      <label htmlFor="hw-film-player">Jogador que acertou</label>
      <select id="hw-film-player" value={player} onChange={event => setPlayer(event.target.value as Player | '')}>
        <option value="">Selecione o jogador</option>{PLAYERS.map(member => <option value={member} key={member}>{name(member)}</option>)}
      </select>
      <label htmlFor="hw-film-attempt">Tentativa do acerto</label>
      <select id="hw-film-attempt" value={attempt} onChange={event => setAttempt(event.target.value)}>
        <option value="">Selecione a tentativa</option><option value="3">1ª tentativa · +3</option>
        <option value="2">2ª tentativa · +2</option><option value="1">3ª tentativa · +1</option>
      </select>
      <button className="hw-button" disabled={disabled || !player || !attempt}>Registrar acerto</button>
    </form>
    <p className="hw-small">A TV e a conferência dos acertos são presenciais. O placar é compartilhado; use +1 / −1 para corrigir.</p>
  </section>
}

export function GameCompletion({ room, game, disabled, act }: { room: Room; game: GameId; disabled: boolean; act: Act }) {
  const completed = room.completedGames.includes(game)
  const eligible = game === 'timer' ? room.timer.rounds.every(round => round.awarded)
    : game === 'sobrevivencia' ? room.survival.completedPlayers.length === 4
      : game === 'drink-russo' ? room.drinkRounds.length > 0 && room.drinkRounds.every(round => round.holder)
        : game === 'fantasia' ? !!room.instagramPostUrl : true
  const awards = CHAMPIONSHIP_POINTS[game].join(' / ')
  return <section className="hw-panel hw-completion"><span className="hw-eyebrow">{completed ? 'RESULTADO HOMOLOGADO' : 'PRÉVIA DO CAMPEONATO'}</span>
    <h3>{completed ? 'Valendo no placar geral' : 'Fechar o ranking do jogo'}</h3>
    <p>{game === 'sobrevivencia' ? 'Menos sustos vence.' : game === 'fantasia' ? 'Mais votos vence.' : 'Mais pontos vence.'} Pesos: {awards}.</p>
    <ul>{PLAYERS.map(player => <li key={player}><span>{name(player)}</span><strong>{formatPoints(championshipPoints(room, player, game))} pts</strong></li>)}</ul>
    <button className={`hw-button ${completed ? 'hw-secondary' : ''}`} disabled={disabled || (!completed && !eligible)}
      onClick={() => act({ action: 'game-status', game, completed: !completed })}>
      <Trophy size={17} />{completed ? 'Reabrir resultado' : 'Concluir jogo e pontuar geral'}
    </button>
    <p className="hw-small">{completed ? 'Reabrir remove temporariamente este jogo do geral e libera correções.'
      : !eligible ? 'Finalize as etapas do jogo para liberar a conclusão.'
        : 'Conclua só depois de todos jogarem. Pontos brutos não são somados diretamente ao geral.'}</p>
  </section>
}

function RoundResult({ round }: { round: TimerRound }) {
  return <div className="hw-table-wrap"><table className="hw-results"><caption>Resultado da rodada · alvo {round.targetSeconds}s</caption>
    <thead><tr><th>Jogador</th><th>Tempo</th><th>Erro</th><th>Pontos</th></tr></thead>
    <tbody>{[...PLAYERS].sort((a, b) => (round.points[b] ?? 0) - (round.points[a] ?? 0)).map(player => {
      const elapsed = round.elapsedMilliseconds[player]
      return <tr key={player}><th>{name(player)}</th><td>{elapsed == null ? 'Ausente' : `${(elapsed / 1000).toFixed(3)}s`}</td>
        <td>{elapsed == null ? '—' : `${(Math.abs(elapsed - round.targetSeconds * 1000) / 1000).toFixed(3)}s`}</td><td>+{round.points[player] ?? 0}</td></tr>
    })}</tbody></table></div>
}

export function SharedTimerGame({ room, player, sync }: { room: Room; player: Player; sync: Sync }) {
  const now = useServerNow(sync.clock)
  const match = room.timer
  const round = match.rounds[match.roundIndex]
  const startsAt = round.startsAt ? Date.parse(round.startsAt) : null
  const countdown = startsAt !== null && now !== null ? Math.max(0, Math.ceil((startsAt - now) / 1000)) : null
  const readyPlayers = PLAYERS.filter(member => round.readyPlayers[member] && now !== null
    && now - Date.parse(round.readyPlayers[member]!) < 60000)
  const clockReady = sync.clock !== null && sync.clock.uncertaintyMs <= 250
    && monotonicEpoch() - sync.clock.sampledAt < 60000
  const stopped = round.stoppedPlayers.includes(player)
  const running = startsAt !== null && now !== null && now >= startsAt && !round.awarded
  const expired = running && now! - startsAt! >= 90000
  const commandBusy = sync.busy || !!sync.pending
  const closed = room.completedGames.includes('timer')
  const done = match.roundIndex === 4 && round.awarded
  const stop = () => {
    if (!sync.clock || startsAt === null) return
    sync.act({ action: 'timer-stop', player, roundId: round.id,
      elapsedMs: Math.max(0, Math.round(monotonicEpoch() + sync.clock.offsetMs - startsAt)) })
  }
  return <section className="hw-panel hw-play">
    <span className="hw-eyebrow">RODADA {match.roundIndex + 1} DE 5 · LARGADA SIMULTÂNEA</span>
    <h2>{done ? 'O tempo revelou o vencedor.' : round.awarded ? 'Rodada encerrada!' : 'Quatro celulares. Uma largada.'}</h2>
    <p>Cada um seleciona seu jogador e abre o Timer no próprio celular. Confirmem “Estou pronto”; uma pessoa inicia para todos, com contagem de 5 segundos.</p>
    <p className="hw-small">Relógio: {clockReady ? `sincronizado (incerteza estimada ±${Math.ceil(sync.clock!.uncertaintyMs)}ms)` : 'sincronizando / latência alta'} · Tempo real: {sync.live ? 'conectado' : 'desconectado'}.</p>
    {!round.awarded && <>
      <div className="hw-target"><span>TEMPO-ALVO</span><strong>{round.targetSeconds}<small>seg</small></strong></div>
      {startsAt === null ? <>
        <div className="hw-readiness">{PLAYERS.map(member => <span key={member} className={readyPlayers.includes(member) ? 'hw-ready' : ''}>{readyPlayers.includes(member) && <Check size={14} />}{name(member)}</span>)}</div>
        <div className="hw-actions"><button className="hw-button hw-secondary" disabled={commandBusy || closed || !clockReady || !sync.live}
          onClick={() => sync.act({ action: 'timer-ready', player, roundId: round.id })}>{readyPlayers.includes(player) ? 'Renovar prontidão' : 'Estou pronto'}</button>
          <button className="hw-button" disabled={commandBusy || closed || !clockReady || !sync.live || readyPlayers.length !== 4}
            onClick={() => sync.act({ action: 'timer-start', roundId: round.id })}>Iniciar para todos</button></div>
        <p className="hw-small">Prontidão vale por 60s. Mantenham a página em primeiro plano e uma conexão estável.</p>
      </> : countdown !== null && countdown > 0 ? <div className="hw-countdown" role="status"><strong>{countdown}</strong><span>Prepare-se, {name(player)}…</span></div>
        : stopped ? <div className="hw-secret"><Check size={45} /><span>Tempo registrado. Aguarde a turma.</span></div>
          : <button className="hw-timer-button hw-running" disabled={commandBusy || !sync.clock || !running || !!expired || closed} onClick={stop}><Timer size={30} />PARAR<small>{name(player)}, confie na sua intuição…</small></button>}
      {startsAt !== null && <p className="hw-small">{round.stoppedPlayers.length} de 4 pararam. Os tempos ficam ocultos até todos terminarem.</p>}
      {expired && <button className="hw-button hw-secondary" disabled={commandBusy || closed}
        onClick={() => sync.act({ action: 'timer-close', roundId: round.id })}>Encerrar ausentes (0 pontos)</button>}
    </>}
    {round.awarded && <>
      <RoundResult round={round} />
      <p className="hw-small">Pontos desta rodada já adicionados ao placar do jogo, uma única vez. Ajustes manuais estão disponíveis ao lado.</p>
      {!done && <button className="hw-button" disabled={commandBusy || closed}
        onClick={() => sync.act({ action: 'timer-next', roundId: round.id })}>Próxima rodada</button>}
    </>}
    {done && <><h3>Resultado final da partida</h3><div className="hw-final">{[...PLAYERS].sort((a, b) => room.scores.timer[b] - room.scores.timer[a]).map(member =>
      <div key={member}><span>{room.scores.timer[member] === Math.max(...Object.values(room.scores.timer)) && <Crown size={18} />} {name(member)}</span><strong>{room.scores.timer[member]} pts</strong></div>)}</div>
      <p className="hw-small">Conclua o jogo no quadro do campeonato para converter o ranking em pontos gerais.</p></>}
    {match.rounds.some((item, index) => index < match.roundIndex && item.awarded) && <details className="hw-history"><summary>Resultados das rodadas anteriores</summary>
      {match.rounds.filter((item, index) => index < match.roundIndex && item.awarded).map(item => <RoundResult key={item.id} round={item} />)}</details>}
    <p className="hw-small">Por rodada: 4 / 3 / 2 / 1 pontos por proximidade do alvo; empates no milissegundo recebem a mesma posição e pulam a seguinte. Ausentes podem ser encerrados após 90s e recebem 0. Alvos progressivos até 30s.</p>
    <p className="hw-small">A largada usa horário do servidor, não a chegada da mensagem. Rede e navegador não oferecem tempo real exato; celular bloqueado ou aba em segundo plano prejudica a sincronização.</p>
  </section>
}

export function DrinkGame({ room, player, disabled, act }: { room: Room; player: Player; disabled: boolean; act: Act }) {
  const round = room.drinkRounds.at(-1)
  const [target, setTarget] = useState<Player | ''>('')
  const [holder, setHolder] = useState<Player | ''>('')
  const [confirm, setConfirm] = useState(false)
  const voted = !!round?.votedPlayers.includes(player)
  return <section className="hw-panel hw-play">
    <span className="hw-eyebrow">QUATRO COPOS · UM BLEFE</span><h2>Quem está fingindo normalidade?</h2>
    <p>Preparem 4 copos: 1 com álcool e 3 sem. Após experimentar, todos votam em outra pessoa. Não revelem o copo diferente até os quatro votos estarem registrados.</p>
    <div className="hw-rule-box"><strong>O blefe vale pontos</strong><p>Voto certo: +2. Quem recebeu álcool: +1 por cada um dos outros três que errou, mais bônus de +2 se ninguém descobrir (até 5 pontos). Voto errado: 0.</p></div>
    {!round || round.holder ? <button className="hw-button" disabled={disabled} onClick={() => { setTarget(''); setHolder(''); setConfirm(false); act({ action: 'drink-start' }) }}>Abrir {room.drinkRounds.length ? 'nova' : 'primeira'} rodada</button>
      : <>
        <h3>Rodada {room.drinkRounds.length}</h3>
        <div className="hw-readiness">{PLAYERS.map(member => <span className={round.votedPlayers.includes(member) ? 'hw-ready' : ''} key={member}>{name(member)} {round.votedPlayers.includes(member) ? '✓' : '…'}</span>)}</div>
        {voted ? <p>Seu voto está registrado e escondido. Aguarde os demais.</p> : <form className="hw-form" onSubmit={event => {
          event.preventDefault()
          if (target) act({ action: 'drink-vote', player, target, roundId: round.id })
        }}><label htmlFor="hw-drink-target">Seu voto, {name(player)}</label><select id="hw-drink-target" value={target} onChange={event => setTarget(event.target.value as Player)}>
          <option value="">Quem recebeu álcool?</option>{PLAYERS.filter(member => member !== player).map(member => <option value={member} key={member}>{name(member)}</option>)}</select>
          <button className="hw-button" disabled={disabled || !target}>Confirmar voto secreto</button></form>}
        {round.votedPlayers.length === 4 && <div className="hw-rule-box"><h3>Todos votaram. Hora da revelação!</h3><label htmlFor="hw-drink-holder">Quem realmente recebeu o copo alcoólico?</label>
          <select id="hw-drink-holder" value={holder} onChange={event => { setHolder(event.target.value as Player); setConfirm(false) }}><option value="">Selecionar jogador</option>{PLAYERS.map(member => <option value={member} key={member}>{name(member)}</option>)}</select>
          {confirm && holder ? <><p>Confirmar que foi {name(holder)}? Isso fecha a rodada e soma os pontos.</p><button className="hw-button" disabled={disabled} onClick={() => act({ action: 'drink-reveal', player: holder, roundId: round.id })}>Confirmar revelação e pontuar</button></>
            : <button className="hw-button hw-secondary" disabled={disabled || !holder} onClick={() => setConfirm(true)}>Revelar resultado</button>}</div>}
      </>}
    {[...room.drinkRounds].reverse().filter(item => item.holder).map((item, index) => <details className="hw-history" key={item.id} open={index === 0}><summary>Rodada {room.drinkRounds.findIndex(other => other.id === item.id) + 1} · copo de {name(item.holder!)}</summary>
      <div className="hw-final">{PLAYERS.map(member => <div key={member}><span>{name(member)} → {name(item.votes[member]!)}</span><strong>+{item.points[member]} pts</strong></div>)}</div></details>)}
    <p className="hw-small">Participação voluntária, sem desafio de quantidade. Combinem ingredientes e restrições antes. Quem não quiser álcool pode usar um sabor diferente sem álcool e jogar com as mesmas regras.</p>
  </section>
}

export function FantasyGame({ room, disabled, act }: { room: Room; disabled: boolean; act: Act }) {
  return <section className="hw-panel hw-play"><span className="hw-eyebrow">O PÚBLICO É O JÚRI</span><h2>O look mais votado do Instagram.</h2>
    <p>Publiquem as quatro fantasias no mesmo post e combinem prazo e regra de voto (por exemplo, um comentário com o nome por perfil). No encerramento, confiram duplicatas e registrem os votos válidos abaixo.</p>
    <form className="hw-form" onSubmit={event => {
      event.preventDefault()
      act({ action: 'instagram', url: String(new FormData(event.currentTarget).get('url')) })
    }}><label htmlFor="hw-instagram-url">Post da votação</label><input id="hw-instagram-url" name="url" type="url" required maxLength={2048} placeholder="https://www.instagram.com/p/..."
      key={room.instagramPostUrl} defaultValue={room.instagramPostUrl ?? ''} /><button className="hw-button hw-secondary" disabled={disabled}>Salvar link do post</button></form>
    {room.instagramPostUrl && <a className="hw-button" href={room.instagramPostUrl} target="_blank" rel="noopener noreferrer">Abrir votação no Instagram <ExternalLink size={16} /></a>}
    <div className="hw-vote-forms">{PLAYERS.map(player => <form key={player} className="hw-form" onSubmit={event => {
      event.preventDefault()
      act({ action: 'fantasy-votes', player, votes: Number(new FormData(event.currentTarget).get('votes')) })
    }}><label htmlFor={`hw-votes-${player}`}>{name(player)} · votos válidos</label><input id={`hw-votes-${player}`} name="votes" type="number" min={0} max={1_000_000} step={1} required
      key={room.scores.fantasia[player]} defaultValue={room.scores.fantasia[player]} /><button className="hw-button hw-secondary" disabled={disabled}>Salvar votos de {name(player)}</button></form>)}</div>
    <p className="hw-small">Sem login ou integração automática com Instagram. A conferência é manual. Ao finalizar, o ranking de votos vale {CHAMPIONSHIP_POINTS.fantasia.join(' / ')} pontos no campeonato.</p>
  </section>
}

export function SurvivalGame({ room, disabled, act, clock, onChange }: { room: Room; disabled: boolean; act: Act; clock: ClockEstimate | null; onChange: (changes: ScoreChange[]) => void }) {
  const now = useServerNow(clock)
  const state = room.survival
  const [selected, setSelected] = useState<Player>('Andre')
  const [cancel, setCancel] = useState(false)
  const endsAt = state.startsAt ? Date.parse(state.startsAt) + 600000 : null
  const remaining = endsAt !== null && now !== null ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : null
  return <section className="hw-panel hw-play"><span className="hw-eyebrow">10 MINUTOS PARA CADA UM</span><h2>Sobreviva sem entregar o susto.</h2>
    <p>Mesma fase, dificuldade e duração para todos. Os outros três observam e contam sustos perceptíveis: grito, pulo, recuo brusco ou tirar as mãos do controle. Uma reação contínua conta como um único susto; na dúvida, decidam por maioria.</p>
    <div className="hw-rule-box"><strong>Menos é mais.</strong><p>O placar deste jogo conta sustos, não pontos. Quem tiver menos fica na frente e recebe {CHAMPIONSHIP_POINTS.sobrevivencia.join(' / ')} pontos no geral.</p></div>
    <div className="hw-readiness">{PLAYERS.map(member => <span className={state.completedPlayers.includes(member) ? 'hw-ready' : ''} key={member}>{name(member)} {state.completedPlayers.includes(member) ? '✓' : '…'}</span>)}</div>
    {state.player ? <>
      <h3>Na cadeira do terror: {name(state.player)}</h3>
      <div className="hw-survival-clock" role="timer">{remaining === null ? 'Sincronizando…' : `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`}</div>
      <p>{room.scores.sobrevivencia[state.player]} sustos registrados</p>
      <div className="hw-actions"><button className="hw-button" disabled={disabled || remaining === 0} onClick={() => onChange([{ player: state.player!, game: 'sobrevivencia', delta: 1 }])}>Registrar susto +1</button>
        <button className="hw-button hw-secondary" disabled={disabled || remaining !== 0} onClick={() => { setCancel(false); act({ action: 'survival-finish', player: state.player! }) }}>Concluir os 10 minutos</button></div>
      {cancel ? <div className="hw-rule-box"><p>Cancelar sem marcar como concluído? A contagem de sustos é preservada e pode ser corrigida no placar.</p><button className="hw-button hw-secondary" disabled={disabled} onClick={() => { setCancel(false); act({ action: 'survival-cancel', player: state.player! }) }}>Confirmar cancelamento</button></div>
        : <button className="hw-text-button" disabled={disabled} onClick={() => setCancel(true)}>Cancelar tentativa</button>}
    </> : state.completedPlayers.length === 4 ? <p>Todos sobreviveram aos 10 minutos! Confira os sustos e conclua o ranking do jogo.</p>
      : <form className="hw-form" onSubmit={event => { event.preventDefault(); act({ action: 'survival-start', player: selected }) }}>
        <label htmlFor="hw-survival-player">Próximo jogador</label><select id="hw-survival-player" value={selected} onChange={event => setSelected(event.target.value as Player)}>{PLAYERS.map(member => <option key={member} value={member} disabled={state.completedPlayers.includes(member)}>{name(member)}</option>)}</select>
        <button className="hw-button" disabled={disabled || !clock || state.completedPlayers.includes(selected)}>Iniciar tentativa de 10 minutos</button></form>}
    <p className="hw-small">As contagens e a tentativa são compartilhadas. Use −1 no placar para corrigir uma reação contada duas vezes. Ninguém é obrigado a continuar se estiver desconfortável.</p>
  </section>
}

export function MimeTeams({ player }: { player: Player }) {
  return <div className="hw-teams">{TEAMS.map(team => <div key={team.name} className={team.players.some(member => member === player) ? 'hw-team-current' : ''}><strong>{team.name}</strong><span>{team.players.some(member => member === player) ? 'Sua dupla' : 'Dupla adversária'}</span></div>)}</div>
}
