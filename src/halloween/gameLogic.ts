import { GAMES, PLAYERS, type GameId, type Player, type Room } from './data.ts'

export function randomIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

export function drawUnused(length: number, used: readonly number[]): number | null {
  const remaining = Array.from({ length }, (_, index) => index).filter(index => !used.includes(index))
  return remaining.length ? remaining[randomIndex(remaining.length)] : null
}

export function totalScore(room: Room, player: Player, game?: GameId): number {
  return game ? room.scores[game][player] : GAMES.reduce((sum, item) => sum + room.scores[item.id][player], 0)
}

export function isRoom(value: unknown): value is Room {
  if (!value || typeof value !== 'object') return false
  const room = value as Partial<Room>
  return typeof room.id === 'string' && /^[a-f0-9-]{36}$/i.test(room.id)
    && Number.isSafeInteger(room.revision) && typeof room.revision === 'number' && room.revision >= 0
    && Array.isArray(room.appliedOperations) && room.appliedOperations.every(id => typeof id === 'string')
    && !!room.scores && GAMES.every(game => PLAYERS.every(player => Number.isSafeInteger(room.scores?.[game.id]?.[player])))
}

export interface TimerTurn { player: Player; elapsedMs: number }
export interface TimerRound { target: number; turns: TimerTurn[] }
export interface TimerMatch { id: string; rounds: TimerRound[]; round: number; startedAt: number | null }

export function createTimerMatch(): TimerMatch {
  return {
    id: crypto.randomUUID(), round: 0, startedAt: null,
    rounds: [[3, 6], [7, 11], [12, 17], [18, 24], [25, 30]]
      .map(([min, max]) => ({ target: min + randomIndex(max - min + 1), turns: [] })),
  }
}

export function roundPoints(round: TimerRound): Record<Player, number> {
  const errors = round.turns.map(turn => Math.abs(turn.elapsedMs - round.target * 1000))
  return Object.fromEntries(PLAYERS.map(player => {
    const turn = round.turns.find(item => item.player === player)
    const error = turn ? Math.abs(turn.elapsedMs - round.target * 1000) : Infinity
    return [player, turn ? 4 - errors.filter(other => other < error).length : 0]
  })) as Record<Player, number>
}

export function timerTotals(match: TimerMatch): Record<Player, number> {
  return Object.fromEntries(PLAYERS.map(player => [
    player, match.rounds.reduce((sum, round) => sum + (round.turns.length === 4 ? roundPoints(round)[player] : 0), 0),
  ])) as Record<Player, number>
}
