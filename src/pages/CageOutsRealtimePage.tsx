import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Camera, CircleAlert, RefreshCw, Video, Wifi, WifiOff } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../services/api'
import { createCageOutLiveSessionConnection, getCageOutLiveSession } from '../services/cageTelemetry'
import type { CageOutLiveSessionResponse } from '../types/cageTelemetry'

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'medium',
})

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const AUTO_POLLING_MS = 3_000
const TRANSIENT_GAP_MS = 5_000

function formatDate(value: string | null): string {
  if (!value) return '-'
  return dateTimeFormatter.format(new Date(value))
}

function formatWeight(value: number | null): string {
  if (value === null) return '-'
  return `${value.toFixed(3)} kg`
}

function toDataUrl(base64Value: string | null): string | null {
  if (!base64Value) return null
  return `data:image/jpeg;base64,${base64Value}`
}

function statusBadgeClass(status: string): string {
  const normalized = status.trim().toLowerCase()
  if (normalized === 'match') return 'bg-[#dcfce7] text-[#166534]'
  if (normalized === 'mismatch') return 'bg-[#fee2e2] text-[#8c2d1c]'
  return 'bg-[#fef3c7] text-[#92400e]'
}

function mergeSnapshots(previous: CageOutLiveSessionResponse | null, incoming: CageOutLiveSessionResponse): CageOutLiveSessionResponse {
  if (!previous) {
    return incoming
  }

  const mergedSession = {
    ...incoming.session,
    photoSnapshotBase64: incoming.session.photoSnapshotBase64 ?? previous.session.photoSnapshotBase64,
    videoSnapshotBase64: incoming.session.videoSnapshotBase64 ?? previous.session.videoSnapshotBase64,
  }

  const previousHadItems = previous.session.items.length > 0
  const incomingEmpty = incoming.session.items.length === 0
  const shouldProtectTransientGap = previousHadItems && incomingEmpty && previous.session.isActive && incoming.isOnline

  if (shouldProtectTransientGap) {
    const previousUpdatedAt = previous.session.lastUpdatedAt ? new Date(previous.session.lastUpdatedAt).getTime() : 0
    const incomingUpdatedAt = incoming.session.lastUpdatedAt ? new Date(incoming.session.lastUpdatedAt).getTime() : 0
    const gap = incomingUpdatedAt > 0 && previousUpdatedAt > 0 ? incomingUpdatedAt - previousUpdatedAt : 0

    if (gap >= 0 && gap <= TRANSIENT_GAP_MS) {
      mergedSession.items = previous.session.items
      mergedSession.scannedCount = previous.session.scannedCount
      mergedSession.approvedCount = previous.session.approvedCount
      mergedSession.currentTotalAmount = previous.session.currentTotalAmount
      mergedSession.checkoutId = previous.session.checkoutId
      mergedSession.sessionStartedAt = previous.session.sessionStartedAt
      mergedSession.lastUpdatedAt = previous.session.lastUpdatedAt
      mergedSession.isActive = previous.session.isActive
    }
  }

  return {
    ...incoming,
    session: mergedSession,
  }
}

export default function CageOutsRealtimePage() {
  const { cageOutId } = useParams<{ cageOutId: string }>()
  const hasLoadedRef = useRef(false)
  const [snapshot, setSnapshot] = useState<CageOutLiveSessionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSignalRConnected, setIsSignalRConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasId = Boolean(cageOutId)

  const loadSnapshot = useCallback(async (showSpinner = true) => {
    if (!cageOutId) return

    if (showSpinner && !hasLoadedRef.current) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await getCageOutLiveSession(cageOutId)
      setSnapshot((previous) => mergeSnapshots(previous, data))
      hasLoadedRef.current = true
      setError(null)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar a sessão ao vivo deste CageOut.'))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [cageOutId])

  useEffect(() => {
    if (!cageOutId) {
      setIsLoading(false)
      return
    }

    let disposed = false
    let stopConnection: (() => Promise<void>) | null = null

    void loadSnapshot(true)

    const connection = createCageOutLiveSessionConnection(cageOutId, (nextSnapshot) => {
      if (disposed) return
      setSnapshot((previous) => mergeSnapshots(previous, nextSnapshot))
      hasLoadedRef.current = true
      setError(null)
      setIsSignalRConnected(true)
      setIsLoading(false)
      setIsRefreshing(false)
    })

    stopConnection = connection.stop

    void connection.start()
      .then(() => {
        if (!disposed) {
          setIsSignalRConnected(true)
        }
      })
      .catch(() => {
        if (!disposed) {
          setIsSignalRConnected(false)
        }
      })

    return () => {
      disposed = true
      setIsSignalRConnected(false)
      if (stopConnection) {
        void stopConnection()
      }
    }
  }, [cageOutId, loadSnapshot])

  useEffect(() => {
    if (!cageOutId) return

    const timer = window.setInterval(() => {
      void loadSnapshot(false)
    }, AUTO_POLLING_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [cageOutId, loadSnapshot])

  const session = snapshot?.session
  const photoImage = useMemo(() => toDataUrl(session?.photoSnapshotBase64 ?? null), [session?.photoSnapshotBase64])
  const videoImage = useMemo(() => toDataUrl(session?.videoSnapshotBase64 ?? null), [session?.videoSnapshotBase64])

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/relatorios/cageouts" className="inline-flex items-center gap-2 text-sm font-semibold text-[#526158] hover:text-[#183c34]">
            <ArrowLeft size={16} />
            Voltar para Telemetria
          </Link>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Relatórios</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">Monitor ao vivo</h1>
          <p className="mt-1 text-sm text-[#526158]">
            {snapshot ? `${snapshot.identifier} · modo ${snapshot.currentMode ?? 'não informado'}` : 'Carregando identificador...'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex h-10 items-center gap-2 border px-3 text-sm font-semibold ${snapshot?.isOnline ? 'border-[#9bd2aa] bg-[#dcfce7] text-[#166534]' : 'border-[#f2b8aa] bg-[#fee2e2] text-[#8c2d1c]'}`}>
            {snapshot?.isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {snapshot?.isOnline ? 'CageOut online' : 'CageOut offline'}
          </span>
          <span className={`inline-flex h-10 items-center gap-2 border px-3 text-sm font-semibold ${isSignalRConnected ? 'border-[#9bd2aa] bg-[#dcfce7] text-[#166534]' : 'border-[#f2d38f] bg-[#fff8e6] text-[#8f6500]'}`}>
            <Wifi size={16} />
            {isSignalRConnected ? 'SignalR conectado' : 'SignalR em reconexão'}
          </span>
          <button
            type="button"
            onClick={() => void loadSnapshot(true)}
            disabled={isLoading || isRefreshing}
            className="flex h-10 items-center gap-2 border border-[#b9c7bd] bg-white px-3 text-sm font-semibold text-[#183c34] transition-colors hover:bg-[#edf3ee] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={isLoading || isRefreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {!hasId && (
        <div className="mb-5 flex items-center gap-3 border border-[#f2b8aa] bg-[#fff1ed] px-4 py-3 text-sm text-[#8c2d1c]" role="alert">
          <CircleAlert size={18} />
          <span>O CageOut informado é inválido.</span>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center gap-3 border border-[#f2b8aa] bg-[#fff1ed] px-4 py-3 text-sm text-[#8c2d1c]" role="alert">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.35fr]">
        <div className="flex flex-col gap-5">
          <article className="overflow-hidden border border-[#d8d0c2] bg-white">
            <header className="flex items-center gap-2 border-b border-[#e8e2d7] px-4 py-3 text-sm font-semibold text-[#183c34]">
              <Camera size={16} />
              Câmera de foto
            </header>
            <div className="flex min-h-[240px] items-center justify-center bg-[#f6f2ea] p-3">
              {photoImage ? (
                <img src={photoImage} alt="Snapshot da câmera de foto" className="max-h-[360px] w-full object-contain" />
              ) : (
                <p className="text-sm text-[#657168]">Snapshot indisponível no momento.</p>
              )}
            </div>
          </article>

          <article className="overflow-hidden border border-[#d8d0c2] bg-white">
            <header className="flex items-center gap-2 border-b border-[#e8e2d7] px-4 py-3 text-sm font-semibold text-[#183c34]">
              <Video size={16} />
              Câmera de vídeo
            </header>
            <div className="flex min-h-[240px] items-center justify-center bg-[#f6f2ea] p-3">
              {videoImage ? (
                <img src={videoImage} alt="Snapshot da câmera de vídeo" className="max-h-[360px] w-full object-contain" />
              ) : (
                <p className="text-sm text-[#657168]">Snapshot RTSP indisponível no momento.</p>
              )}
            </div>
          </article>
        </div>

        <article className="overflow-hidden border border-[#d8d0c2] bg-white">
          <header className="border-b border-[#e8e2d7] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#183c34]">Compra em andamento</p>
              <p className="text-xs text-[#657168]">Última atualização: {formatDate(snapshot?.generatedAt ?? null)}</p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`inline-flex items-center px-2 py-1 font-semibold ${session?.isActive ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#eef2f7] text-[#475569]'}`}>
                {session?.isActive ? 'Sessão ativa' : 'Sem sessão ativa'}
              </span>
              <span className="inline-flex items-center bg-[#edf3ee] px-2 py-1 font-semibold text-[#526158]">
                Checkout: {session?.checkoutId || '-'}
              </span>
              <span className="inline-flex items-center bg-[#edf3ee] px-2 py-1 font-semibold text-[#526158]">
                Itens: {session?.scannedCount ?? 0}
              </span>
              <span className="inline-flex items-center bg-[#edf3ee] px-2 py-1 font-semibold text-[#526158]">
                Aprovados: {session?.approvedCount ?? 0}
              </span>
              <span className="inline-flex items-center bg-[#edf3ee] px-2 py-1 font-semibold text-[#526158]">
                Total: {currencyFormatter.format(session?.currentTotalAmount ?? 0)}
              </span>
            </div>
          </header>

          {!snapshot && isLoading ? (
            <div className="flex min-h-52 items-center justify-center text-sm font-medium text-[#5e675f]">Carregando sessão ao vivo...</div>
          ) : !session || session.items.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center px-6 text-center text-sm text-[#5e675f]">
              Nenhum item em compra no momento para este CageOut.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Hora</th>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Produto</th>
                    <th className="px-4 py-3 text-right font-semibold">Qtd.</th>
                    <th className="px-4 py-3 text-right font-semibold">Peso esp.</th>
                    <th className="px-4 py-3 text-right font-semibold">Peso real</th>
                    <th className="px-4 py-3 text-right font-semibold">Unitário</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {session.items.map((item) => (
                    <tr key={item.itemId} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                      <td className="px-4 py-3">{formatDate(item.scannedAt)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#183c34]">{item.productCode}</td>
                      <td className="px-4 py-3">{item.productName}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatWeight(item.expectedWeightKg)}</td>
                      <td className="px-4 py-3 text-right">{formatWeight(item.realWeightKg)}</td>
                      <td className="px-4 py-3 text-right">{item.unitPrice === null ? '-' : currencyFormatter.format(item.unitPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.matchStatus)}`}>
                          {item.matchStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
