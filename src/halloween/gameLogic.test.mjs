import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CHARACTERS, GAMES, MIME_PROMPTS, PLAYERS, RECORDED_MISSIONS, UNRECORDED_MISSIONS } from './data.ts'
import { championshipPoints, CHAMPIONSHIP_POINTS, comparePlayers, drawUnused, estimateClock, placementPoints, totalScore } from './gameLogic.ts'

test('mission draws exhaust both pools without repeating, including across serialization', () => {
  let state = { recorded: [], unrecorded: [] }
  for (let turn = 0; turn < 7; turn++) {
    const recorded = drawUnused(RECORDED_MISSIONS.length, state.recorded)
    const unrecorded = drawUnused(UNRECORDED_MISSIONS.length, state.unrecorded)
    assert.ok(!state.recorded.includes(recorded))
    assert.ok(!state.unrecorded.includes(unrecorded))
    state = JSON.parse(JSON.stringify({
      recorded: [...state.recorded, recorded], unrecorded: [...state.unrecorded, unrecorded],
    }))
  }
  assert.equal(drawUnused(7, state.recorded), null)
  assert.equal(drawUnused(7, state.unrecorded), null)
})

test('each deck delivers all its cards without repeats before exhaustion', () => {
  for (const deck of [CHARACTERS, MIME_PROMPTS]) {
    const used = []
    const drawn = new Set()
    for (let turn = 0; turn < deck.length; turn++) {
      const index = drawUnused(deck.length, used)
      assert.notEqual(index, null)
      assert.ok(!drawn.has(deck[index]))
      drawn.add(deck[index])
      used.push(index)
    }
    assert.equal(drawn.size, deck.length)
    assert.equal(drawUnused(deck.length, used), null)
  }
})

test('mime themes use only one or two words', () => {
  for (const prompt of MIME_PROMPTS) {
    const words = prompt.trim().split(/\s+/).filter(Boolean)
    assert.ok(words.length >= 1 && words.length <= 2, `Tema longo ou vazio: ${prompt}`)
  }
})

const newRoom = () => ({
  completedGames: [],
  scores: Object.fromEntries(GAMES.map(game => [game.id, Object.fromEntries(PLAYERS.map(player => [player, 0]))])),
})

test('only completed games contribute weighted placement points, not raw scores', () => {
  for (const game of ['timer', 'drink-russo', 'quem-sou-eu', 'sobrevivencia']) {
    const room = newRoom()
    room.scores[game] = game === 'sobrevivencia'
      ? { Andre: 0, Duda: 1, Leh: 2, Maicon: 3 } : { Andre: 20, Duda: 15, Leh: 10, Maicon: 5 }
    assert.equal(totalScore(room, 'Andre'), 0)
    room.completedGames.push(game)
    assert.deepEqual(PLAYERS.map(player => totalScore(room, player)), [60, 40, 25, 10])
    if (game !== 'sobrevivencia') room.scores[game].Andre = 9999
    assert.equal(totalScore(room, 'Andre'), 60)
    room.completedGames = []
    assert.equal(totalScore(room, 'Andre'), 0)
  }
})

test('ties divide the points of the occupied positions without inflating the game budget', () => {
  const awards = CHAMPIONSHIP_POINTS.timer
  const values = [10, 10, 5, 0]
  assert.deepEqual(values.map((_, index) => placementPoints(values, index, awards)), [50, 50, 25, 10])
  assert.equal(values.reduce((sum, _, index) => sum + placementPoints(values, index, awards), 0), 135)
  assert.equal(placementPoints([0, 0, 0, 0], 0, awards), 33.75)
})

test('mime teammates share the team award instead of competing against each other', () => {
  const room = newRoom()
  room.scores.mimica = { Andre: 5, Maicon: 5, Leh: 3, Duda: 3 }
  assert.deepEqual(PLAYERS.map(player => championshipPoints(room, player, 'mimica')), [70, 35, 35, 70])
  room.scores.mimica.Leh = room.scores.mimica.Duda = 5
  assert.deepEqual(PLAYERS.map(player => championshipPoints(room, player, 'mimica')), [52.5, 52.5, 52.5, 52.5])
})

test('survival ranks fewer scares higher, Instagram ranks more votes higher', () => {
  const room = newRoom()
  room.scores.sobrevivencia = { Andre: 0, Duda: 3, Leh: 1, Maicon: 8 }
  room.scores.fantasia = { Andre: 200, Duda: 100, Leh: 50, Maicon: 10 }
  assert.deepEqual([...PLAYERS].sort((a, b) => comparePlayers(room, a, b, 'sobrevivencia')), ['Andre', 'Leh', 'Duda', 'Maicon'])
  assert.deepEqual(PLAYERS.map(player => championshipPoints(room, player, 'sobrevivencia')), [60, 25, 40, 10])
  room.completedGames.push('sobrevivencia', 'fantasia')
  assert.equal(totalScore(room, 'Andre'), 160)
})

test('a clock sample corrects different phone clocks to the same scheduled start', () => {
  for (const phoneOffset of [-7200000, 0, 300000]) {
    const sample = estimateClock(100000 + phoneOffset, 100100 + phoneOffset, 100050)
    assert.equal(sample.uncertaintyMs, 50)
    assert.equal(105000 + phoneOffset + sample.offsetMs, 105000)
  }
})
