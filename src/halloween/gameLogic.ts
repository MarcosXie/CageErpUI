import { GAMES, PLAYERS, TEAMS, type GameId, type Player, type Room } from './data.ts'

export const CHAMPIONSHIP_POINTS: Record<GameId, readonly number[]> = {
  missoes: [80, 55, 30, 15], mimica: [70, 35], 'drink-russo': [60, 40, 25, 10],
  'quem-sou-eu': [60, 40, 25, 10], timer: [60, 40, 25, 10],
  sobrevivencia: [60, 40, 25, 10], fantasia: [100, 70, 40, 20],
}

export function placementPoints(values: readonly number[], index: number, awards: readonly number[], ascending = false): number {
  const score = values[index]
  const ahead = values.filter(other => ascending ? other < score : other > score).length
  const tied = values.filter(other => other === score).length
  return awards.slice(ahead, ahead + tied).reduce((sum, points) => sum + points, 0) / tied
}

export function championshipPoints(room: Room, player: Player, game: GameId): number {
  if (game === 'mimica') {
    const teamIndex = TEAMS.findIndex(team => team.players.some(member => member === player))
    return placementPoints(TEAMS.map(team => room.scores.mimica[team.players[0]]), teamIndex, CHAMPIONSHIP_POINTS.mimica)
  }
  return placementPoints(PLAYERS.map(member => room.scores[game][member]), PLAYERS.indexOf(player),
    CHAMPIONSHIP_POINTS[game], game === 'sobrevivencia')
}

export function comparePlayers(room: Room, a: Player, b: Player, game?: GameId): number {
  return game === 'sobrevivencia' ? totalScore(room, a, game) - totalScore(room, b, game)
    : totalScore(room, b, game) - totalScore(room, a, game)
}

export function formatPoints(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export function randomIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

export function drawUnused(length: number, used: readonly number[]): number | null {
  const remaining = Array.from({ length }, (_, index) => index).filter(index => !used.includes(index))
  return remaining.length ? remaining[randomIndex(remaining.length)] : null
}

export function totalScore(room: Room, player: Player, game?: GameId): number {
  return game ? room.scores[game][player] : GAMES.reduce((sum, item) =>
    sum + (room.completedGames.includes(item.id) ? championshipPoints(room, player, item.id) : 0), 0)
}

export function isRoom(value: unknown): value is Room {
  if (!value || typeof value !== 'object') return false
  const room = value as Partial<Room>
  return typeof room.id === 'string' && /^[a-f0-9-]{36}$/i.test(room.id)
    && Number.isSafeInteger(room.revision) && typeof room.revision === 'number' && room.revision >= 0
    && Array.isArray(room.appliedOperations) && room.appliedOperations.every(id => typeof id === 'string')
    && !!room.scores && GAMES.every(game => PLAYERS.every(player => Number.isSafeInteger(room.scores?.[game.id]?.[player])))
    && Array.isArray(room.completedGames) && room.completedGames.every(id => GAMES.some(game => game.id === id))
    && !!room.timer && Array.isArray(room.timer.rounds) && room.timer.rounds.length === 5
    && Number.isInteger(room.timer.roundIndex) && room.timer.roundIndex >= 0 && room.timer.roundIndex < 5
    && room.timer.rounds.every(round => typeof round.id === 'string' && Number.isFinite(round.targetSeconds)
      && !!round.readyPlayers && Array.isArray(round.stoppedPlayers) && !!round.elapsedMilliseconds && !!round.points)
    && Array.isArray(room.drinkRounds) && room.drinkRounds.every(round =>
      typeof round.id === 'string' && Array.isArray(round.votedPlayers) && !!round.votes && !!round.points)
    && !!room.survival && Array.isArray(room.survival.completedPlayers)
}

export interface ClockEstimate { offsetMs: number; uncertaintyMs: number; sampledAt: number }
export function estimateClock(sentAt: number, receivedAt: number, serverTime: number): ClockEstimate {
  return { offsetMs: serverTime - (sentAt + receivedAt) / 2, uncertaintyMs: (receivedAt - sentAt) / 2, sampledAt: receivedAt }
}
export const monotonicEpoch = () => performance.timeOrigin + performance.now()
