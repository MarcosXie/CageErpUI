import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import { CheckCircle2, CircleAlert, Filter, Image as ImageIcon, PackageCheck, RefreshCw, RotateCcw, Video as VideoIcon, X } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { getRejects, resolveReject } from '../services/rejects'
import { ESTORNO_REASON, rejectReasonLabels, type RejectRecord } from '../types/rejects'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const weightFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})

type RejectMedia = {
  type: 'image' | 'video'
  url: string
  productName: string
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function formatWeight(value: number) {
  return `${weightFormatter.format(value)} kg`
}

function toLocalDateKey(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function RejeitosPage() {
  const [rejects, setRejects] = useState<RejectRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<RejectMedia | null>(null)
  const [checkoutFilter, setCheckoutFilter] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')
  const [unresolvedOnly, setUnresolvedOnly] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const deferredCheckoutFilter = useDeferredValue(checkoutFilter)

  const normalizedCheckoutFilter = deferredCheckoutFilter.trim().toLocaleLowerCase('pt-BR')
  const filteredRejects = rejects.filter((reject) => {
    const rejectDate = toLocalDateKey(reject.createdAt)

    return (!normalizedCheckoutFilter || reject.checkoutId.toLocaleLowerCase('pt-BR').includes(normalizedCheckoutFilter))
      && (!reasonFilter || reject.reason === Number(reasonFilter))
      && (!unresolvedOnly || !reject.isResolved)
      && (!startDate || rejectDate >= startDate)
      && (!endDate || rejectDate <= endDate)
  })
  const hasActiveFilters = Boolean(checkoutFilter || reasonFilter || unresolvedOnly || startDate || endDate)

  const loadRejects = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setRejects(await getRejects())
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar as paradas agora.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRejects()
  }, [loadRejects])

  useEffect(() => {
    if (!selectedMedia) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedMedia(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [selectedMedia])

  async function handleResolve(id: string) {
    if (!window.confirm('A imagem/vídeo deste rejeito será apagada permanentemente. Deseja marcar como resolvido?')) {
      return
    }

    setResolvingId(id)
    setError(null)

    try {
      const updated = await resolveReject(id)
      setRejects((current) => current.map((item) => (item.id === id ? updated : item)))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível marcar o rejeito como resolvido.'))
    } finally {
      setResolvingId(null)
    }
  }

  function clearFilters() {
    setCheckoutFilter('')
    setReasonFilter('')
    setUnresolvedOnly(false)
    setStartDate('')
    setEndDate('')
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Relatórios</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">Paradas</h1>
        </div>
        <button
          type="button"
          onClick={() => void loadRejects()}
          disabled={isLoading}
          className="flex h-10 items-center gap-2 border border-[#b9c7bd] bg-white px-3 text-sm font-semibold text-[#183c34] transition-colors hover:bg-[#edf3ee] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 border border-[#f2b8aa] bg-[#fff1ed] px-4 py-3 text-sm text-[#8c2d1c]" role="alert">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-5 border border-[#d8d0c2] bg-white px-4 py-4 sm:px-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#183c34]">
            <Filter size={18} />
            <h2 className="text-sm font-bold">Filtros</h2>
            <span className="border border-[#d8d0c2] bg-[#f7f4ee] px-2 py-0.5 text-xs font-semibold text-[#657168]">
              {filteredRejects.length} {filteredRejects.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="flex h-9 items-center gap-2 px-2 text-xs font-semibold text-[#526158] hover:bg-[#edf3ee] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={15} />
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12 xl:items-end">
          <label className="block xl:col-span-3">
            <span className="mb-1.5 block text-xs font-semibold text-[#526158]">Checkout</span>
            <input
              type="search"
              value={checkoutFilter}
              onChange={(event) => setCheckoutFilter(event.target.value)}
              placeholder="Buscar pelo checkout"
              className="h-11 w-full border border-[#c9d1ca] bg-[#fdfbf7] px-3 text-sm text-[#183c34] outline-none transition-colors placeholder:text-[#98a198] focus:border-[#397663] focus:ring-2 focus:ring-[#397663]/15"
            />
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-[#526158]">Motivo</span>
            <select
              value={reasonFilter}
              onChange={(event) => setReasonFilter(event.target.value)}
              className="h-11 w-full border border-[#c9d1ca] bg-[#fdfbf7] px-3 text-sm text-[#183c34] outline-none transition-colors focus:border-[#397663] focus:ring-2 focus:ring-[#397663]/15"
            >
              <option value="">Todos os motivos</option>
              {Object.entries(rejectReasonLabels).map(([reason, label]) => (
                <option key={reason} value={reason}>{label}</option>
              ))}
            </select>
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-[#526158]">Data inicial</span>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 w-full border border-[#c9d1ca] bg-[#fdfbf7] px-3 text-sm text-[#183c34] outline-none transition-colors focus:border-[#397663] focus:ring-2 focus:ring-[#397663]/15"
            />
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-[#526158]">Data final</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 w-full border border-[#c9d1ca] bg-[#fdfbf7] px-3 text-sm text-[#183c34] outline-none transition-colors focus:border-[#397663] focus:ring-2 focus:ring-[#397663]/15"
            />
          </label>

          <label className="flex h-11 cursor-pointer items-center gap-3 border border-[#c9d1ca] bg-[#fdfbf7] px-3 xl:col-span-3">
            <input
              type="checkbox"
              checked={unresolvedOnly}
              onChange={(event) => setUnresolvedOnly(event.target.checked)}
              className="h-4 w-4 accent-[#1f6553]"
            />
            <span className="text-sm font-semibold text-[#183c34]">Somente não resolvidos</span>
          </label>
        </div>
      </div>

      <div className="overflow-hidden border border-[#d8d0c2] bg-white">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center text-sm font-medium text-[#5e675f]">Carregando rejeitos...</div>
        ) : filteredRejects.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center text-[#5e675f]">
            <PackageCheck size={30} className="mb-3 text-[#849088]" />
            <p className="font-semibold text-[#183c34]">
              {rejects.length === 0 ? 'Nenhum rejeito registrado.' : 'Nenhum rejeito encontrado.'}
            </p>
            <p className="mt-1 text-sm">
              {rejects.length === 0 ? 'Os itens recusados no checkout aparecerão aqui.' : 'Revise ou limpe os filtros para ampliar a busca.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Horário</th>
                  <th className="px-5 py-3 font-semibold">Checkout</th>
                  <th className="px-5 py-3 font-semibold">Produto</th>
                  <th className="px-5 py-3 font-semibold">Código</th>
                  <th className="px-5 py-3 text-right font-semibold">Peso esperado</th>
                  <th className="px-5 py-3 text-right font-semibold">Peso real</th>
                  <th className="px-5 py-3 font-semibold">Motivo</th>
                  <th className="px-5 py-3 font-semibold">Mídia</th>
                  <th className="px-5 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRejects.map((reject) => (
                  <tr key={reject.id} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                    <td className="px-5 py-4 font-medium">{formatDate(reject.createdAt)}</td>
                    <td className="px-5 py-4">{reject.checkoutId}</td>
                    <td className="px-5 py-4 font-medium text-[#183c34]">{reject.productName}</td>
                    <td className="px-5 py-4 text-[#657168]">{reject.productCode}</td>
                    <td className="px-5 py-4 text-right">{formatWeight(reject.expectedWeight)}</td>
                    <td className="px-5 py-4 text-right">{formatWeight(reject.realWeight)}</td>
                    <td className="px-5 py-4">
                      <span className="border border-[#e0d6c4] bg-[#fdfbf7] px-2 py-1 text-xs font-semibold text-[#5e675f]">
                        {rejectReasonLabels[reject.reason] ?? 'Não informado'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {reject.productImageUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedMedia({ type: 'image', url: reject.productImageUrl!, productName: reject.productName })}
                            className="flex items-center gap-1 text-[#1f6553] hover:text-[#123d33]"
                            title="Ver imagem"
                            aria-label={`Ver imagem de ${reject.productName}`}
                          >
                            <ImageIcon size={16} />
                          </button>
                        )}
                        {reject.productVideoUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedMedia({ type: 'video', url: reject.productVideoUrl!, productName: reject.productName })}
                            className="flex items-center gap-1 text-[#1f6553] hover:text-[#123d33]"
                            title="Ver vídeo"
                            aria-label={`Ver vídeo de ${reject.productName}`}
                          >
                            <VideoIcon size={16} />
                          </button>
                        )}
                        {!reject.productImageUrl && !reject.productVideoUrl && <span className="text-[#a3ab9f]">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {reject.isResolved ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#5e675f]">
                          <CheckCircle2 size={15} />
                          Resolvido
                        </span>
                      ) : reject.reason === ESTORNO_REASON ? (
                        <span className="text-[#a3ab9f]">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleResolve(reject.id)}
                          disabled={resolvingId === reject.id}
                          className="text-xs font-semibold text-[#c1444c] hover:text-[#8c2d1c] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Marcar como resolvido
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#11231e]/70 px-4 py-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMedia(null)
            }
          }}
        >
          <section
            className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden border border-[#cfc6b7] bg-[#fdfbf7] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedMedia.type === 'image' ? 'Imagem' : 'Vídeo'} do rejeito de ${selectedMedia.productName}`}
          >
            <div className="flex min-h-16 items-center justify-between border-b border-[#d8d0c2] px-5 py-3">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-semibold text-[#183c34]">
                  {selectedMedia.type === 'image' ? 'Imagem do rejeito' : 'Vídeo do rejeito'}
                </p>
                <p className="mt-1 truncate text-sm text-[#5e675f]">{selectedMedia.productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center text-[#536057] hover:bg-[#edf3ee]"
                aria-label="Fechar mídia"
                title="Fechar"
              >
                <X size={21} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#17211d] p-3 sm:p-5">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={`Registro do rejeito de ${selectedMedia.productName}`}
                  className="max-h-[calc(100vh-9rem)] max-w-full object-contain"
                />
              ) : (
                <video
                  key={selectedMedia.url}
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[calc(100vh-9rem)] max-w-full bg-black"
                >
                  Seu navegador não suporta a reprodução deste vídeo.
                </video>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
