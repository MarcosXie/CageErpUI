import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CHARACTERS, MIME_PROMPTS, PLAYERS, RECORDED_MISSIONS, UNRECORDED_MISSIONS } from './data.ts'
import { createTimerMatch, drawUnused, roundPoints, timerTotals } from './gameLogic.ts'

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

test('each deck delivers exactly 100 different cards before exhaustion', () => {
  for (const deck of [CHARACTERS, MIME_PROMPTS]) {
    const used = []
    const drawn = new Set()
    for (let turn = 0; turn < 100; turn++) {
      const index = drawUnused(deck.length, used)
      assert.notEqual(index, null)
      assert.ok(!drawn.has(deck[index]))
      drawn.add(deck[index])
      used.push(index)
    }
    assert.equal(drawn.size, 100)
    assert.equal(drawUnused(deck.length, used), null)
  }
})

test('timer ranks absolute millisecond errors and gives ties equal competition ranks', () => {
  const points = roundPoints({
    target: 10,
    turns: [
      { player: 'Andre', elapsedMs: 9800 },
      { player: 'Duda', elapsedMs: 10200 },
      { player: 'Leh', elapsedMs: 10000 },
      { player: 'Maicon', elapsedMs: 12000 },
    ],
  })
  assert.deepEqual(points, { Andre: 3, Duda: 3, Leh: 4, Maicon: 1 })
  const unfinished = createTimerMatch()
  unfinished.rounds[0].turns = [{ player: 'Andre', elapsedMs: 0 }]
  assert.deepEqual(timerTotals(unfinished), { Andre: 0, Duda: 0, Leh: 0, Maicon: 0 })
})

test('timer has five strictly increasing targets at most 30 seconds and sums all rounds', () => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const match = createTimerMatch()
    assert.equal(match.rounds.length, 5)
    match.rounds.forEach((round, index) => {
      assert.ok(round.target >= 3 && round.target <= 30)
      if (index) assert.ok(round.target > match.rounds[index - 1].target)
      round.turns = PLAYERS.map((player, position) => ({ player, elapsedMs: round.target * 1000 + position * 100 }))
    })
    assert.deepEqual(timerTotals(match), { Andre: 20, Duda: 15, Leh: 10, Maicon: 5 })
  }
})
