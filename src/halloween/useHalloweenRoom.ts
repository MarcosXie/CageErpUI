import { useCallback, useEffect, useRef, useState } from 'react'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import axios from 'axios'
import { api, getApiErrorMessage } from '../services/api'
import type { GameAction, Room, ScoreChange } from './data'
import { estimateClock, isRoom, monotonicEpoch, type ClockEstimate } from './gameLogic'

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
interface PendingAction extends GameAction { operationId: string }
type PendingCommand = PendingScore | PendingAction
function isPending(value: unknown): value is PendingCommand | null {
  if (value === null) return true
  if (!value || typeof value !== 'object') return false
  const pending = value as Partial<PendingScore & PendingAction>
  return typeof pending.operationId === 'string' && (typeof pending.action === 'string' || (Array.isArray(pending.changes)
    && pending.changes.length > 0 && pending.changes.length <= 4
    && pending.changes.every(change => typeof change?.player === 'string'
      && typeof change.game === 'string' && Number.isInteger(change.delta))))
}

export function useHalloweenRoom(id: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState('')
  const [syncError, setSyncError] = useState('')
  const [busy, setBusy] = useState(false)
  const [live, setLive] = useState(false)
  const [liveError, setLiveError] = useState('')
  const [clock, setClock] = useState<ClockEstimate | null>(null)
  const [clockError, setClockError] = useState('')
  const [canDiscard, setCanDiscard] = useState(false)
  const inFlight = useRef(false)
  const pending = useSessionValue<PendingCommand | null>(`halloween.pending.${id}`, () => null, isPending)
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
          setSyncError('')
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setSyncError(getApiErrorMessage(cause, 'Não foi possível sincronizar o placar. Confira a API e o link da sala.'))
        }
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, 3000)
      }
    }
    void refresh()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [id, acceptRoom])

  useEffect(() => {
    let active = true
    let reconnect: ReturnType<typeof setTimeout>
    const base = new URL(api.defaults.baseURL || '', location.origin)
    const hubUrl = new URL(`${base.pathname.replace(/\/api\/?$/, '').replace(/\/$/, '')}/hubs/halloween`, base.origin)
    const connection = new HubConnectionBuilder().withUrl(hubUrl.href)
      .withAutomaticReconnect().configureLogging(LogLevel.Warning).build()
    connection.on('RoomUpdated', (data: unknown) => {
      try { acceptRoom(data) } catch { setLiveError('O servidor enviou um estado de jogo inválido.') }
    })
    const subscribe = async () => {
      await connection.invoke('SubscribeRoom', id)
      const { data } = await api.get<unknown>(`/halloween/sessions/${id}`)
      if (active) {
        acceptRoom(data)
        setLive(true)
        setLiveError('')
      }
    }
    const connect = async () => {
      try { await connection.start(); await subscribe() }
      catch {
        if (active) {
          setLive(false)
          setLiveError('Tempo real indisponível. O placar usa consultas; o Timer exige reconexão para preparar a largada.')
          await connection.stop()
          if (active) { clearTimeout(reconnect); reconnect = setTimeout(connect, 5000) }
        }
      }
    }
    connection.onreconnecting(() => {
      if (active) { setLive(false); setLiveError('Reconectando o tempo real. Mantenha esta tela aberta.') }
    })
    connection.onreconnected(async () => {
      try { await subscribe() }
      catch { if (active) { setLive(false); setLiveError('Não foi possível reinscrever esta sala. Recarregue a página.') } }
    })
    connection.onclose(() => {
      if (active) {
        setLive(false)
        setLiveError('Tempo real desconectado. Tentando novamente…')
        clearTimeout(reconnect)
        reconnect = setTimeout(connect, 5000)
      }
    })
    void connect()
    return () => {
      active = false
      clearTimeout(reconnect)
      void connection.stop().catch(cause => console.error('Falha ao encerrar conexão Halloween.', cause))
    }
  }, [id, acceptRoom])

  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    let sampling = false
    const synchronize = async () => {
      if (sampling) return
      sampling = true
      clearTimeout(timer)
      try {
        const samples: ClockEstimate[] = []
        for (let index = 0; index < 3; index++) {
          const sentAt = monotonicEpoch()
          const { data } = await api.get<{ serverTime: string }>('/halloween/clock', { signal: controller.signal })
          const receivedAt = monotonicEpoch()
          const serverTime = Date.parse(data.serverTime)
          if (!Number.isFinite(serverTime)) throw new Error('Relógio do servidor inválido.')
          samples.push(estimateClock(sentAt, receivedAt, serverTime))
        }
        if (!controller.signal.aborted) {
          const best = samples.sort((a, b) => a.uncertaintyMs - b.uncertaintyMs)[0]
          setClock(best)
          setClockError(best.uncertaintyMs > 250 ? 'Latência alta para a largada. Use uma conexão mais estável antes de ficar pronto.' : '')
        }
      } catch {
        if (!controller.signal.aborted) {
          setClockError('Não foi possível sincronizar o relógio com o servidor.')
        }
      } finally {
        sampling = false
        if (!controller.signal.aborted) timer = setTimeout(synchronize, 30000)
      }
    }
    const onVisible = () => { if (document.visibilityState === 'visible') void synchronize() }
    document.addEventListener('visibilitychange', onVisible)
    void synchronize()
    return () => { controller.abort(); clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [id])

  const submit = async (operation: PendingCommand) => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setCanDiscard(false)
    try {
      const endpoint = 'action' in operation ? 'actions' : 'scores'
      const response = await api.post<unknown>(`/halloween/sessions/${id}/${endpoint}`, operation)
      acceptRoom(response.data)
      pending.save(null)
      setError('')
    } catch (cause) {
      setCanDiscard(axios.isAxiosError(cause) && [400, 404, 409].includes(cause.response?.status || 0))
      const message: unknown = axios.isAxiosError(cause) ? cause.response?.data?.Message : null
      setError(typeof message === 'string' ? message
        : getApiErrorMessage(cause, 'Não foi possível confirmar a ação. Reenvie a pendência; não será duplicada.'))
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  const queue = (operation: PendingCommand) => {
    if (inFlight.current || busy || pending.value || pending.error) return
    if (pending.save(operation)) void submit(operation)
  }
  const changeScores = (changes: ScoreChange[]) => queue({ operationId: crypto.randomUUID(), changes })
  const act = (action: GameAction) => queue({ ...action, operationId: crypto.randomUUID() })

  return {
    room, error: error || syncError || pending.error, busy, pending: pending.value,
    live, liveError, clock, clockError, act, canDiscard,
    changeScores, retry: () => { if (pending.value) void submit(pending.value) },
    discard: () => { if (canDiscard && pending.save(null)) { setCanDiscard(false); setError('') } },
  }
}
