import { useCallback, useEffect, useRef, useState } from 'react'
import { api, getApiErrorMessage } from '../services/api'
import type { Room, ScoreChange } from './data'
import { isRoom } from './gameLogic'

export function useSessionValue<T>(key: string, initial: () => T, validate: (value: unknown) => value is T) {
  const [stored, setStored] = useState<{ value: T; error: string }>(() => {
    try {
      const raw = sessionStorage.getItem(key)
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw)
        if (!validate(parsed)) throw new Error('Dados incompatíveis.')
        return { value: parsed, error: '' }
      }
      return { value: initial(), error: '' }
    } catch {
      return { value: initial(), error: 'Não foi possível ler a sessão deste navegador. Libere o armazenamento ou limpe somente os dados locais desta sala.' }
    }
  })

  const save = (value: T): boolean => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
      setStored({ value, error: '' })
      return true
    } catch {
      setStored(previous => ({ ...previous, error: 'Não foi possível salvar neste navegador. Libere o armazenamento antes de continuar.' }))
      return false
    }
  }
  return { value: stored.value, save, error: stored.error }
}

interface PendingScore { operationId: string; changes: ScoreChange[] }
function isPending(value: unknown): value is PendingScore | null {
  if (value === null) return true
  if (!value || typeof value !== 'object') return false
  const pending = value as PendingScore
  return typeof pending.operationId === 'string' && Array.isArray(pending.changes)
    && pending.changes.length > 0 && pending.changes.length <= 4
    && pending.changes.every(change => typeof change?.player === 'string'
      && typeof change.game === 'string' && Number.isInteger(change.delta))
}

export function useHalloweenRoom(id: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inFlight = useRef(false)
  const pending = useSessionValue<PendingScore | null>(`halloween.pending.${id}`, () => null, isPending)
  const acceptRoom = useCallback((data: unknown) => {
    if (!isRoom(data) || data.id !== id) throw new Error('Resposta inválida da sala.')
    setRoom(previous => previous && previous.revision > data.revision ? previous : data)
  }, [id])

  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    const refresh = async () => {
      try {
        const response = await api.get<unknown>(`/halloween/sessions/${id}`, { signal: controller.signal })
        if (!controller.signal.aborted) {
          acceptRoom(response.data)
          setError('')
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(cause, 'Não foi possível sincronizar o placar. Confira a API e o link da sala.'))
        }
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, 3000)
      }
    }
    void refresh()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [id, acceptRoom])

  const submit = async (operation: PendingScore) => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    try {
      const response = await api.post<unknown>(`/halloween/sessions/${id}/scores`, operation)
      acceptRoom(response.data)
      pending.save(null)
      setError('')
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Não foi possível confirmar os pontos. Use “Reenviar pontos pendentes”; não serão duplicados.'))
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  const changeScores = (changes: ScoreChange[], operationId: string = crypto.randomUUID()) => {
    if (inFlight.current || busy || pending.value || pending.error) return
    const operation = { operationId, changes }
    if (pending.save(operation)) void submit(operation)
  }

  return {
    room, error: error || pending.error, busy, pending: pending.value,
    changeScores, retry: () => { if (pending.value) void submit(pending.value) },
  }
}
